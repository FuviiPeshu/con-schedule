import { Route, Routes } from "react-router-dom";

import { LayoutComponent } from "./components/Layout/";
import { EventDetailsPage } from "./pages/EventDetailsPage/EventDetailsPage.component";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage.component";
import { SchedulePage } from "./pages/SchedulePage/SchedulePage.component";

export default function App() {
    return (
        <LayoutComponent>
            <Routes>
                <Route path="/" element={<SchedulePage />} />
                <Route path="/event/:eventId" element={<EventDetailsPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </LayoutComponent>
    );
}
