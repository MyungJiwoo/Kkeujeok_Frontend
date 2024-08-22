import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import CreateBoard from './pages/CreateBoardPage';
import CreatePersonalBoard from './pages/CreatePersonalBoardPage';
import CreateTeamBoard from './pages/CreateTeamBoardPage';
import OAuthRedirectHandler from './contexts/OAuthRedirectHandler';
import { AuthProvider } from './contexts/AuthContext';
import TeamDocument from './pages/TeamDocument';
import TeamFileBoard from './pages/TeamFileBoard';
import SidePage from './pages/SidePage';

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" Component={MainPage}>
          <Route path="/personalBlock/:id" Component={SidePage} />
        </Route>
        <Route path="/login" Component={LoginPage} />
        <Route path="/api/oauth2/callback/:provider" element={<OAuthRedirectHandler />} />
        <Route path="/createBoard" Component={CreateBoard} />
        <Route path="/createPersonalBoard" Component={CreatePersonalBoard} />
        <Route path="/createTeamBoard" Component={CreateTeamBoard} />
        <Route path="/mypage" Component={MyPage} />
        <Route path="/teamdocument" Component={TeamDocument} />
        <Route path="/teamdocument/:id" Component={TeamFileBoard} />
      </Routes>
    </AuthProvider>
  </Router>
);

export default App;
