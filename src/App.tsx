import { Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout/Layout.component";
import { EventDetailPage } from "./pages/EventDetailPage/EventDetailPage.component";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage.component";
import { SchedulePage } from "./pages/SchedulePage/SchedulePage.component";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<SchedulePage />} />
                <Route path="/event/:eventId" element={<EventDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Layout>
    );
}
