import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./components/HomePage";
<<<<<<< HEAD
=======
import { InterviewPage } from "./components/InterviewPage";
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
<<<<<<< HEAD
=======
      { path: "interview/:courseId", Component: InterviewPage },
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      { path: "curriculum/:courseId", Component: CurriculumPage },
      { path: "learn/:courseId/:itemId", Component: LearnPage },
      { path: "notes", Component: NotesPage },
      { path: "notes/:courseId", Component: NotesPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
<<<<<<< HEAD
]);
=======
]);
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
