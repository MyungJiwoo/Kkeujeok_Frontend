import Navbar from '../components/Navbar';
import theme from '../styles/Theme/Theme';
import DashboardCard from '../components/DashboardCard';
import deleteicon from '../img/delete2.png';
import main from '../img/main.png';
import main2 from '../img/main2.png';
import main3 from '../img/main3.png';
import Header from '../components/Header';
import * as S from '../styles/MainPageStyled';

const MainPage = () => {
  return (
    <S.MainDashBoardLayout>
      <Navbar />
      <S.MainDashBoardContainer>
        <Header mainTitle="개인 대시보드" subTitle="개인 대시보드 설명하는 자리입니다" />
        <S.CardContainer>
          <DashboardCard
            backGroundColor="#E8FBFF"
            highlightColor={theme.color.main3}
            state="시작 전"
            imgSrc={main3}
          />
          <DashboardCard
            backGroundColor="#EDF3FF"
            highlightColor={theme.color.main}
            state="진행 중"
            imgSrc={main}
          />
          <DashboardCard
            backGroundColor="#F7F1FF"
            highlightColor={theme.color.main2}
            state="완료"
            imgSrc={main2}
          />
        </S.CardContainer>

        <S.DeleteIcon>
          <img src={deleteicon} alt="휴지통아이콘" />
        </S.DeleteIcon>
      </S.MainDashBoardContainer>
    </S.MainDashBoardLayout>
  );
};
export default MainPage;
