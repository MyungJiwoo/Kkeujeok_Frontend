import { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import * as S from '../styles/MainPageStyled';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { handleAutoScroll } from '../utils/handleAutoScroll';
import { useLocation } from 'react-router-dom';
import { StatusPersonalBlock } from '../types/PersonalBlock';
import {
  deleteBlock,
  getDeleteBlock,
  updateOrderBlock,
  updatePersonalBlock,
} from '../api/PersonalBlockApi';
import { useDebounce } from '../hooks/useDebounce';
import { initialColumns } from '../utils/columnsConfig';
import { DashboardItem } from '../types/PersonalDashBoard';
import { getPersonalBlock, getPersonalDashboard } from '../api/BoardApi';
import DeleteButton from '../components/DeleteButton';
import { useAtom } from 'jotai';
import { fetchTriggerAtom } from '../contexts/atoms';
import { getTeamDashboard } from '../api/TeamDashBoardApi';
import { TeamDashboardInfoResDto } from '../types/TeamDashBoard';
import 'react-toastify/dist/ReactToastify.css';
import { flushSync } from 'react-dom';
export type TItemStatus = 'todo' | 'doing' | 'done' | 'delete';

const MainPage = () => {
  const location = useLocation();
  const dashboardId = location.pathname.split('/')[1];

  const [page, setPage] = useState<number>(0);
  const [fetchTrigger] = useAtom(fetchTriggerAtom); // 상태 트리거 가져오기
  const [dashboardDetail, setDashboardDetail] = useState<DashboardItem | null>(null);
  const [teamDashboardDetail, setTeamDashboardDetail] = useState<TeamDashboardInfoResDto | null>(
    null
  );

  // const { data } = useQuery({ queryKey: ['alarm'], queryFn: getAlarmEnrollment });

  const [columns, setColumns] = useState<{
    [key in TItemStatus]: {
      id: string;
      list: StatusPersonalBlock['blockListResDto'];
      pageInfo?: StatusPersonalBlock['pageInfoResDto'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component?: React.ComponentType<any>;
      backGroundColor?: string;
      highlightColor?: string;
      progress?: string;
      imgSrc?: string;
    };
  }>(initialColumns);

  // 개인 및 팀 대시보드 데이터를 가져오는 useCallback 함수
  const fetchData = useCallback(
    async (page: number = 0) => {
      try {
        // 개인 및 팀 데이터를 병렬로 가져옴
        const [todo, doing, done, remove, personalDashboardData, teamDashboardData] =
          await Promise.all([
            getPersonalBlock(dashboardId, page, 10, 'NOT_STARTED'),
            getPersonalBlock(dashboardId, page, 10, 'IN_PROGRESS'),
            getPersonalBlock(dashboardId, page, 10, 'COMPLETED'),
            getDeleteBlock(dashboardId),
            getPersonalDashboard(dashboardId),
            getTeamDashboard(dashboardId),
          ]);

        // 개인 블록 데이터를 업데이트
        if (todo && doing && done) {
          setColumns(prevColumns => ({
            ...prevColumns,
            todo: {
              ...prevColumns.todo,
              list:
                page === 0
                  ? todo.blockListResDto
                  : [...prevColumns.todo.list, ...todo.blockListResDto],
              pageInfo: todo.pageInfoResDto,
            },
            doing: {
              ...prevColumns.doing,
              list:
                page === 0
                  ? doing.blockListResDto
                  : [...prevColumns.doing.list, ...doing.blockListResDto],
              pageInfo: doing.pageInfoResDto,
            },
            done: {
              ...prevColumns.done,
              list:
                page === 0
                  ? done.blockListResDto
                  : [...prevColumns.done.list, ...done.blockListResDto],
              pageInfo: done.pageInfoResDto,
            },
            delete: {
              ...prevColumns.delete,
              list: page === 0 ? remove.blockListResDto : [...remove.blockListResDto],
              pageInfo: remove.pageInfoResDto,
            },
          }));
        }

        // 개인 대시보드 데이터 업데이트
        setDashboardDetail(personalDashboardData);

        if (teamDashboardData)
          // 팀 대시보드 데이터 업데이트
          setTeamDashboardDetail(teamDashboardData);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    },
    [dashboardId]
  );

  // 데이터 fetch 후 팀 또는 개인 대시보드 데이터를 설정
  useEffect(() => {
    setPage(0);
    setColumns(prevColumns => ({
      ...prevColumns,
      todo: {
        ...prevColumns.todo,
        list: [],
        pageInfo: { currentPage: 0, totalPages: 1, totalItems: 1 },
      },
      doing: {
        ...prevColumns.doing,
        list: [],
        pageInfo: { currentPage: 0, totalPages: 1, totalItems: 1 },
      },
      done: {
        ...prevColumns.done,
        list: [],
        pageInfo: { currentPage: 0, totalPages: 1, totalItems: 1 },
      },
      delete: {
        ...prevColumns.delete,
        list: prevColumns.delete.list, // 휴지통 리스트 유지
        pageInfo: prevColumns.delete.pageInfo, // 휴지통 페이지 정보 유지
      },
    }));

    fetchData(0);
    fetchDashboardData();
  }, [location.pathname, fetchData]);

  // 페이지가 변경될 때 데이터를 다시 가져옴
  useEffect(() => {
    if (page > 0) {
      fetchData(page);
    }
  }, [page, fetchData]);

  useEffect(() => {
    fetchBlockData(0); // 페이지가 로드될 때 처음으로 데이터를 불러옵니다.
  }, [dashboardId]);

  // fetchTrigger 상태가 변경되면 데이터를 다시 불러옴
  useEffect(() => {
    fetchBlockData(0); // 트리거가 변경되면 다시 데이터 호출
  }, [fetchTrigger]);
  // 블록 순서 변경 디바운스 처리
  const debouncedData = useDebounce(columns, 10);

  useEffect(() => {
    const orderArray = {
      notStartedList: columns.todo.list.map(item => item.blockId),
      inProgressList: columns.doing.list.map(item => item.blockId),
      completedList: columns.done.list.map(item => item.blockId),
    };
    updateOrderBlock(orderArray);
  }, [debouncedData]);

  // * get 대시보드 블록
  const fetchBlockData = async (page: number = 0) => {
    try {
      const [todo, doing, done, remove] = await Promise.all([
        getPersonalBlock(dashboardId, page, 10, 'NOT_STARTED'),
        getPersonalBlock(dashboardId, page, 10, 'IN_PROGRESS'),
        getPersonalBlock(dashboardId, page, 10, 'COMPLETED'),
        getDeleteBlock(dashboardId),
      ]);

      const removeBlockList = Array.isArray(remove?.blockListResDto) ? remove.blockListResDto : [];

      // 데이터가 존재하는지 확인
      if (todo && doing && done) {
        setColumns(prevColumns => ({
          ...prevColumns,
          todo: {
            ...prevColumns.todo,
            list:
              page === 0
                ? todo.blockListResDto
                : [...prevColumns.todo.list, ...todo.blockListResDto],
            pageInfo: todo.pageInfoResDto,
          },
          doing: {
            ...prevColumns.doing,
            list:
              page === 0
                ? doing.blockListResDto
                : [...prevColumns.doing.list, ...doing.blockListResDto],
            pageInfo: doing.pageInfoResDto,
          },
          done: {
            ...prevColumns.done,
            list:
              page === 0
                ? done.blockListResDto
                : [...prevColumns.done.list, ...done.blockListResDto],
            pageInfo: done.pageInfoResDto,
          },
          delete: {
            ...prevColumns.delete,
            list: page === 0 ? remove.blockListResDto : [...remove.blockListResDto],
            pageInfo: remove.pageInfoResDto,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch block data:', error);
    }
  };

  // 세로 무한 스크롤 감지 이벤트
  const handleLoadMore = async () => {
    setPage(prevPage => prevPage + 1);
  };

  // 드래그 앤 드롭 핸들러
  const onDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) return;

    const sourceKey = source.droppableId as TItemStatus;
    const destinationKey = destination.droppableId as TItemStatus;

    const sourceList = columns[sourceKey]?.list || [];
    const destinationList = columns[destinationKey]?.list || [];

    if (!columns[sourceKey] || !columns[destinationKey]) {
      console.error('Invalid source or destination key');
      return;
    }

    // const sourceList = columns[sourceKey].list;
    // const destinationList = columns[destinationKey].list;

    const blockId = sourceList[source.index]?.blockId;
    if (!blockId) return;

    if (sourceKey === destinationKey) {
      const newList = Array.from(sourceList);
      const [movedItem] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, movedItem);
      // ! 강제 렌더링
      flushSync(() => {
        setColumns({
          ...columns,
          [sourceKey]: {
            ...columns[sourceKey],
            list: newList,
          },
        });
      });
    } else {
      const [movedItem] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, movedItem);
      if (destinationKey !== 'delete') updatePersonalBlock(blockId, status(destinationKey));
      else deleteBlock(blockId);
      if (sourceKey === 'delete') {
        deleteBlock(blockId);
      }
      setColumns({
        ...columns,
        [sourceKey]: {
          ...columns[sourceKey],
          list: sourceList,
        },
        [destinationKey]: {
          ...columns[destinationKey],
          list: destinationList,
        },
      });
    }
  };

  // 대시보드 상세 정보 가져오기
  const fetchDashboardData = async () => {
    const data = await getPersonalDashboard(dashboardId);

    if (data) setDashboardDetail(data);
  };
  // 유효한 데이터에 따라 mainTitle과 subTitle을 설정
  const mainTitle = teamDashboardDetail?.title || dashboardDetail?.title || '대시보드 제목';
  const subTitle =
    teamDashboardDetail?.description || dashboardDetail?.description || '대시보드 설명';
  const blockProgress = teamDashboardDetail?.blockProgress || dashboardDetail?.blockProgress || 0;

  return (
    <S.MainDashBoardLayout>
      <Navbar />
      <S.MainDashBoardContainer>
        <Header
          mainTitle={mainTitle}
          subTitle={subTitle}
          blockProgress={blockProgress}
          dashboardType={dashboardDetail ? true : false}
        />
        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={handleAutoScroll}>
          <S.CardContainer>
            {Object.values(columns).map(column => {
              const { id, component: DashboardComponent, ...props } = column;
              if (!DashboardComponent) {
                return null;
              }
              return (
                <DashboardComponent
                  key={id}
                  id={id}
                  dashboardId={dashboardId}
                  onLoadMore={handleLoadMore}
                  {...props}
                />
              );
            })}
          </S.CardContainer>
          <DeleteButton key="delete" id="delete" removeValue={true} list={columns.delete.list} />
        </DragDropContext>
      </S.MainDashBoardContainer>
    </S.MainDashBoardLayout>
  );
};

export default MainPage;

// Helper 함수: status 변환을 위한 함수
const status = (status: string) => {
  switch (status) {
    case 'todo':
      return 'NOT_STARTED';
    case 'doing':
      return 'IN_PROGRESS';
    case 'done':
      return 'COMPLETED';
    case 'delete':
      return 'DELETED';
    default:
      return 'UNKNOWN';
  }
};
