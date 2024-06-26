import Page404 from "lib/pages/404";
import UploadPage from "lib/pages/upload";
import React from "react";
import type { PathRouteProps } from "react-router-dom";


const Home = React.lazy(() => import("lib/pages/home"));
const Wallet = React.lazy(() => import("lib/pages/wallet"));
const Profile = React.lazy(() => import("lib/pages/profile"));
const AuthorProfilePage = React.lazy(() => import("lib/pages/profile/authorProfile"));  
const BeCool = React.lazy(() => import("lib/pages/profile/beCool"));  
const TutorialPage = React.lazy(() => import("lib/pages/home/tutorialPage"));  
const PostPage = React.lazy(() => import("lib/pages/postpage"));  
const QFS = React.lazy(() => import("lib/pages/qfs"));  
const ThatsGnarly = React.lazy(() => import("lib/pages/home/Feed/thatsgnarly"));  
const PepeCaptcha = React.lazy(() => import("lib/pages/secret-spot"));  
const NewUpload = React.lazy(() => import("lib/pages/upload/newUpload"));  
const Shelf = React.lazy(() => import("lib/pages/home/videos/lbry"));    
export const routes: Array<PathRouteProps> = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/404",
    element: <Page404 />,
  },  
  {
    path: "/wallet",
    element: <Wallet />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/upload",
    element: <UploadPage/>,
  },
  {
    path: "/becool",
    element: <BeCool  />

  },
  {
    path: "/tutorial",
    element: <TutorialPage />,
    
  },
{
    path: "/post/:postUrl/*",
    element: <PostPage />,
},

{
    path: "/profile/:username",
    element: <AuthorProfilePage />,
},
{
  path: "/qfs",
  element: <QFS />,
},

{ 
  path: "/thatsgnarly",
  element: <ThatsGnarly />,
},
{
  path: "/secret",
  element: <PepeCaptcha />,
},
{
  path: "/newupload",
  element:  <NewUpload />,
},

{
  path: "/secret",
  element: <Shelf />,
},

];

export const privateRoutes: Array<PathRouteProps> = [];

