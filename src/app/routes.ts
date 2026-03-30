import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./components/HomePage";
import { InterviewPage } from "./components/InterviewPage";
import { CurriculumPage } from "./components/CurriculumPage";
import { LearnPage } from "./components/LearnPage";
import { NotesPage } from "./components/NotesPage";
import { ProfilePage } from "./components/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "interview/:courseId", Component: InterviewPage },
      { path: "curriculum/:courseId", Component: CurriculumPage },
      { path: "learn/:courseId/:itemId", Component: LearnPage },
      { path: "notes", Component: NotesPage },
      { path: "notes/:courseId", Component: NotesPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);