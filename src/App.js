import React, {useState} from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import './App.css';

function parseErrorPositionFromStack(stack) {
  const expression = /(?<=anonymous>:)(.*)(?=\))/g;
  let [line, column] = stack.match(expression).pop().split(':');
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
  let result = {output: null, isError: false};
  try {
    win.eval(code);
    result.output = win.document.querySelector('body').innerText;
  } catch (error) {
    const errorPosition = parseErrorPositionFromStack(error.stack);
    const errorMessage = error.name + ': ' + error.message + ' (line: ' + errorPosition.line + ', column: ' + errorPosition.column + ')';
    result.output = errorMessage;
    result.isError = true;
  }

  return result;
};

const initialCode = `for (let i = 0; i < 5; i++) {
    console.log('a');
}`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState({});

  const runCode = (code) => {
    const result = run(code);
    setResult(result);
  };

  return (
      <div className="App">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => Prism.highlight(code, Prism.languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
        <button onClick={() => runCode(code)}>Run code</button>
        <div id="output" className={result.isError ? 'error' : ''}>{result.output}</div>
      </div>
  );
}

export default App;
