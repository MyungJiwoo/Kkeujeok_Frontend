import { useNavigate, Outlet } from 'react-router-dom';
import Block from './Block';
import * as S from '../styles/DashboardStyled';
import { useAtom } from 'jotai';
import { visibleAtom } from '../contexts/sideScreenAtom';
import SidePage from '../pages/SidePage';

type Props = {
  backGroundColor?: string;
  highlightColor?: string;
  progress?: string;
  imgSrc?: string;
};

const NotStartedDashboard = ({ backGroundColor, highlightColor, progress, imgSrc }: Props) => {
  const navigate = useNavigate();
  const [visibleValue, _] = useAtom(visibleAtom);

  const handleAddBtn = () => {
    console.log(progress);
    navigate(`/side/1`, { state: { highlightColor, progress } });
  };

  return (
    <S.CardContainer backGroundColor={backGroundColor}>
      <header>
        <S.StatusBarContainer highlightColor={highlightColor}>
          <span>{progress}</span>
        </S.StatusBarContainer>
        <S.AddButtonWrapper onClick={handleAddBtn}>
          <img src={imgSrc} alt="블록 더하는 버튼" />
        </S.AddButtonWrapper>
      </header>
      <section>
        <Block />
      </section>
      <Outlet />
    </S.CardContainer>
  );
};
export default NotStartedDashboard;
