import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layouts/AppLayout";
import { ComponentsPlaygroundPage } from "./pages/ComponentsPlaygroundPage";
import { GamePage } from "./pages/GamePage";
import { HelloWorldPage } from "./pages/HelloWorldPage";
import { HomePage } from "./pages/HomePage";
import { ResultPage } from "./pages/ResultPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hello" element={<HelloWorldPage />} />
        <Route path="/play" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route
          path="/playground"
          element={
            <AppLayout>
              <ComponentsPlaygroundPage />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
