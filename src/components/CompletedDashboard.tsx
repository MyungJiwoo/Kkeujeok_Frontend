import { useNavigate, Outlet } from 'react-router-dom';
import Block from './Block';
import * as S from '../styles/DashboardStyled';
import { createPersonalBlock } from '../api/PersonalBlockApi';
import SidePage from '../pages/SidePage';
import { Droppable } from 'react-beautiful-dnd';
import theme from '../styles/Theme/Theme';
import main2 from '../img/main2.png';
import { BlockListResDto } from '../types/PersonalBlock';

type Props = {
  // list: StatusPersonalBlock | undefined;
  list: BlockListResDto[];
  id: string;
  dashboardId: string;
};

const CompletedDashboard = ({ list, id, dashboardId }: Props) => {
  const navigate = useNavigate();
  // const blocks = list.flatMap((item: StatusPersonalBlock) => item.blockListResDto);
  // const blocks = list?.blockListResDto;

  const settings = {
    backGroundColor: '#F7F1FF',
    highlightColor: theme.color.main2,
    progress: '완료',
    imgSrc: main2,
  };

  // + 버튼 누르면 사이드 페이지로 이동
  const handleAddBtn = async () => {
    // 초기 post 요청은 빈 내용으로 요청. 추후 patch로 자동 저장.
    const now = new Date();
    const startDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} 00:00`;
    const deadLine = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} 23:59`;

    const data = {
      dashboardId: dashboardId,
      title: '',
      contents: '',
      progress: 'COMPLETED',
      startDate: startDate,
      deadLine: deadLine,
    };

    const blockId = await createPersonalBlock(data);
    // console.log(blockId);

    const { highlightColor, progress } = settings;
    navigate(`personalBlock/${blockId}`, { state: { highlightColor, progress, blockId } });
  };

  return (
    <S.CardContainer backGroundColor={settings.backGroundColor}>
      <header>
        <S.StatusBarContainer highlightColor={settings.highlightColor}>
          <span>{settings.progress}</span>
        </S.StatusBarContainer>
        <S.AddButtonWrapper onClick={handleAddBtn}>
          <img src={settings.imgSrc} alt="블록 더하는 버튼" />
        </S.AddButtonWrapper>
      </header>
      <Droppable droppableId={id}>
        {provided => (
          <S.BoxContainer
            ref={provided.innerRef}
            className="container"
            {...provided.droppableProps}
          >
            {list?.map((block, index) => (
              <Block
                dashboardId={dashboardId}
                key={block.blockId}
                index={index}
                title={block.title ?? ''}
                dDay={block.dDay ?? 0}
                contents={block.contents ?? ''}
                blockId={block.blockId ?? '0'}
                dType={block.dType ?? 'TeamDashboard'}
                name={block.nickname ?? '이름 없음'}
              />
            ))}
            {provided.placeholder}
          </S.BoxContainer>
        )}
      </Droppable>
      <Outlet />
    </S.CardContainer>
  );
};
export default CompletedDashboard;
