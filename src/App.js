import React, {useState} from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import './App.css';

function parseErrorPositionFromStack(stack) {
  const expression = /(?<=anonymous>:)(.*)(?=\))/g;
  const positionString = stack.split('\n')
      .filter(msg => msg.indexOf('eval') !== -1).shift().match(expression);
  if (!positionString) {
    return null;
  }
  const [line, column] = positionString.pop().split(':');
  return {line, column};
}

const run = (code) => {
  const oldFrame = document.querySelector('#sandbox');
  if (oldFrame) {
    oldFrame.remove();
  }
  const frame = document.createElement('iframe');
  frame.id = 'sandbox';
  frame.style = 'display: none';
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  win.console.log = (msg) => win.document.write(msg);
  let result = {output: null, errorMessage: null};
  try {
    win.eval(code);
    result.output = win.document.querySelector('body').innerText;
  } catch (error) {
    let errorMessage = error.name + ': ' + error.message;
    const errorPosition = parseErrorPositionFromStack(error.stack);
    if (errorPosition) {
      errorMessage += ' (line: ' + errorPosition.line + ', column: ' + errorPosition.column + ')'
    }
    result.errorMessage = errorMessage;
  }

  return result;
};

const initialCode = `for (let i = 0; i < 5; i++) {
    console.log('a');
}`;

const KEY_CODE_CMD = 91;
const KEY_CODE_R = 82;

function App() {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState({});
  const [cmdDown, setCmdDown] = useState(false);

  const runCode = (code) => {
    const result = run(code);
    setResult(result);
  };

  return (
      <div className="app">
        <div>
          <button onClick={() => runCode(code)} title={"CMD + R (while focus on editor)"}>Run code</button>
        </div>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => Prism.highlight(code, Prism.languages.js)}
          className="editor"
          padding={10}
          onKeyDown={event => {
            if (cmdDown) {
              if (event.keyCode === KEY_CODE_R) {
                event.preventDefault();
                runCode(code);
              }
            } else if (event.keyCode === KEY_CODE_CMD) {
              setCmdDown(true);
            }
          }}
          onKeyUp={event => {
            if (event.keyCode === KEY_CODE_CMD) {
              setCmdDown(false);
            }
          }}
        />
        <div id="output" className={'output' + (result.errorMessage ? ' error' : '')}>
          {result.errorMessage ? result.errorMessage : result.output}
        </div>
      </div>
  );
}

export default App;
