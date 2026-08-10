import { RouterProvider } from 'react-router-dom';
import { router } from './router';

/**
 * 应用入口组件
 */
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
