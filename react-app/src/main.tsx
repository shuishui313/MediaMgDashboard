import ReactDOM from 'react-dom/client';
import MainApp from './App';
import './default.css';
import { bootstrapTheme } from './utils/theme';

// 首帧前同步主题，避免暗色偏好用户看到一闪白屏。
bootstrapTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <MainApp />
  // </React.StrictMode>
);
