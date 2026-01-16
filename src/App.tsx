import './App.css'
import _ from 'lodash';
import { PagePoems } from './pages/Poems';
import { BrowserRouter, createBrowserRouter, Outlet, Route, RouterProvider, Routes } from 'react-router';
import { PagePoemStrokes } from './pages/PoemStrokes';
import { PageCharQuiz } from './pages/CharQuiz';

function Root() {
  return <div>
    <Outlet />
  </div>
};

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="edu-poems" Component={Root} >
        <Route index Component={PagePoems} />
        <Route path="strokes" Component={PagePoemStrokes} />
        <Route path="char-quiz" Component={PageCharQuiz} />
        <Route path="dizigui" element={<p>dizigui</p>} />
      </Route>
    </Routes>
  </BrowserRouter>
}

export default App
