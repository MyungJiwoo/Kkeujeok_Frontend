import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import closebutton from '../img/closebutton.png';
import {
  CreateDashBoardLayout,
  CreateDashBoardContainer,
  Title,
  SubTitle,
  CreateDashBoardModal,
  SubmitBtn,
  CreateForm,
  Label,
  Input,
  RowWrapper,
  Textarea,
  InvitedBtn,
  Member,
  MemberImage,
  MemberEmail,
  MemberState,
  MemberWrapper,
  DelBtn,
  LastLabel,
  MemberWrapperMemberView,
  ImgWrapper,
  MemberInfo,
} from '../styles/CreateBoardPageStyled';
import Flex from '../components/Flex';
import { TeamDashboardInfoResDto } from '../types/TeamDashBoard';
import {
  createTeamDashBoard,
  deleteTeamDashboard,
  getTeamDashboard,
  patchTeamDashBoard,
} from '../api/TeamDashBoardApi';
import useModal from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import { quitTeamDashboard } from '../api/BoardApi';
import { ProfileData } from '../types/UserInfo';
import userDefault from '../img/userDefault.png';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { userInfoApi } from '../api/UserApi';

const CreateTeamBoard = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation();
  let dashboardId = location.pathname.split('/').pop() || null;
  if (dashboardId === 'createTeamBoard') dashboardId = null; // dashboard 첫 생성시 dashboard id 값을 null로 만들어 줌

  const { isModalOpen, openModal, handleYesClick, handleNoClick } = useModal(); // 모달창 관련 훅 호출
  const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
  const [isEmptyModalOpen, setIsEmptyModalOpen] = useState<boolean>(false);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState<boolean>(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>(''); // 팀원 이메일 저장 (input) : 새로 입력된 팀원 이메일만 관리
  const [members, setMembers] = useState<string[]>([]); // 팀원 이메일 리스트
  const [joinMembers, setJoinMembers] = useState<ProfileData[]>([]); // 기존 팀원 리스트
  const [formData, setFormData] = useState<TeamDashboardInfoResDto>({
    title: '',
    description: '',
    // myId: '',
    // creatorId: '',
  });
  const [isCreator, setIsCreator] = useState({
    myId: '',
    creatorId: '',
  });

  // * 사용자 대시보드 해시태그 불러오기 & 대시보드 수정이라면 대시보드 상세 데이터 불러오기
  const fetchData = async () => {
    if (dashboardId) {
      const data = await getTeamDashboard(dashboardId);

      setJoinMembers(data?.joinMembers ?? []); // 기존 팀원 리스트
      setFormData({
        title: data?.title ?? '', // 제목
        description: data?.description ?? '', // 설명
        // myId: data?.myId ?? '',
        // creatorId: data?.creatorId ?? '',
      });
      setIsCreator({ myId: data?.myId ?? '', creatorId: data?.creatorId ?? '' });
      // if (data?.myId !== data?.creatorId) setIsCreator(false); // 데이터 받아올 때 팀원이라면 false로
      // if (data?.myId !== data?.creatorId) console.log('팀원입니다');
    }
  };

  useEffect(() => {
    fetchData();
  }, [dashboardId]);

  // input 데이터 설정 함수 (제목, 설명)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // 이메일 입력 함수
  const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(event.target.value);
  };

  // 이메일 전송 처리 함수 : 팀원 리스트에 추가 후 화면에 보여줌
  const handleAddMember = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault(); // 버튼 기본 동작인 새로고침 방지

    if (emailInput) {
      setMembers(prevMembers => [emailInput, ...prevMembers]);
      setEmailInput('');
    }
  };

  // 제출시 빈 칸이 있나 확인하는 함수 (있다면 true)
  const validateFormData = (formData: TeamDashboardInfoResDto): boolean => {
    return Object.values(formData).some(value => value === '');
  };

  // 대시보드 생성(제출) 함수
  const submitTeamDashboard = async () => {
    // 빈 작성란이 있으면 모달창 띄우기. 모두 작성되었으면 최종 제출
    if (validateFormData(formData)) {
      setIsEmptyModalOpen(true);
      const handleModalClose = () => setIsEmptyModalOpen(false);
      openModal('normal', handleModalClose); // yes, no 모두 모달창 끄도록 호출
    } else {
      try {
        // todo : 이메일 / 고유번호 가르기
        // ["1206jiwoo@gmail.com", "지우#1234", "mong12@naver.com", "mooo@daum.net", "몽디#1555", "끄적#1023"]
        const invitedEmails: string[] = [];
        const invitedNicknamesAndTags: string[] = [];

        // 정규식 정의
        const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const nicknameTagRegex = /^[^\s@]+#[0-9]{4}$/;

        // 데이터 분류
        members.forEach(member => {
          if (emailRegex.test(member)) {
            invitedEmails.push(member);
          } else if (nicknameTagRegex.test(member)) {
            invitedNicknamesAndTags.push(member);
          }
        });

        // console.log(invitedEmails);
        // console.log(invitedNicknamesAndTags);

        // members를 invitedEmails에 추가
        const updatedFormData = {
          ...formData,
          invitedEmails: invitedEmails, // 사용자가 입력한 팀원 이메일을 제출할 데이터에 추가
          invitedNicknamesAndTags: invitedNicknamesAndTags,
        };

        const responseDashboardId = dashboardId
          ? await patchTeamDashBoard(dashboardId, updatedFormData) // 기존 대시보드 수정
          : await createTeamDashBoard(updatedFormData); // 새 대시보드 생성
        navigate(`/team/${responseDashboardId}`); // 해당 대시보드 페이지로 이동
      } catch (error) {
        console.error('팀 대시보드 생성 및 수정시 오류 발생!', error);
      }
    }
  };

  // * 팀 대시보드 삭제 api
  const deleteDashboard = async () => {
    if (dashboardId) {
      await deleteTeamDashboard(dashboardId);
      navigate(`/tutorial`);
      localStorage.removeItem('LatestBoard');
    }
  };

  // * 팀 대시보드 삭제 모달창
  const submitDelDashboard = () => {
    setIsDelModalOpen(true);
    const handleModalClose = () => setIsDelModalOpen(false);
    openModal('yes', deleteDashboard, handleModalClose); // yes 버튼이 눌릴 때만 대시보드 삭제 api 요청
  };

  // * 팀 대시보드 탈퇴 api
  const quitDashboard = async () => {
    if (dashboardId) {
      await quitTeamDashboard(dashboardId);
      navigate(`/tutorial`);
      localStorage.removeItem('LatestBoard');
    }
  };

  // * 팀 대시보드 탈퇴 모달창
  const submitQuitDashboard = () => {
    setIsQuitModalOpen(true);
    const handleModalClose = () => setIsQuitModalOpen(false);
    openModal('yes', quitDashboard, handleModalClose); // yes 버튼이 눌릴 때만 대시보드 삭제 api 요청
  };

  // * 뒤로가기 (초대할 팀원 이메일이 남아있는지 확인하고 모달창)
  const back = () => {
    if (members.length > 0) {
      setIsBackModalOpen(true);
      const handleModalClose = () => setIsBackModalOpen(false);
      openModal('yes', () => navigate(-1), handleModalClose); // yes 버튼이 눌릴 때만 대시보드 삭제 api 요청
    } else navigate(-1);
  };

  const onMypage = () => {
    navigate(`/mypage`);
  };

  const onFriendPage = (id: number | string) => {
    navigate(`/friendpage/${id}`, {
      state: { wrapper: true },
    });
  };
  return (
    <>
      <Helmet>
        <title>끄적끄적 | 대시보드 생성</title>
      </Helmet>
      <CreateDashBoardLayout>
        <Navbar />
        <CreateDashBoardContainer>
          <CreateDashBoardModal>
            <ImgWrapper src={closebutton} alt="닫기 버튼" onClick={back} />
            {isCreator?.myId === isCreator.creatorId ? (
              <>
                <Title>팀 대시보드 {dashboardId ? '수정' : '생성'}</Title>
                <SubTitle>팀 이름과 팀 소개를 설정하고 팀원을 초대하세요.</SubTitle>
              </>
            ) : (
              <Title>팀 대시보드 상세 정보</Title>
            )}

            <CreateForm>
              <Flex alignItems="flex-start">
                <Flex flexDirection="column">
                  <RowWrapper>
                    <Label>팀 이름</Label>
                    <Input
                      type="text"
                      placeholder="팀 이름을 입력해주세요."
                      width="15rem"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={dashboardId && formData?.myId !== formData.creatorId ? true : false} // 방장일 때만 수정 가능
                    ></Input>
                  </RowWrapper>

                  <RowWrapper>
                    <Label>팀 소개</Label>
                    <Textarea
                      placeholder="간단하게 팀을 소개해주세요."
                      width="15rem"
                      maxLength={300}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={
                        dashboardId && isCreator?.myId !== isCreator.creatorId ? true : false
                      } // 방장일 때만 수정 가능
                    />
                  </RowWrapper>
                </Flex>

                <Flex flexDirection="column" alignItems="center">
                  <RowWrapper>
                    {/* ! 팀원일 때 스타일 오류나면 고쳐야 할 곳 */}
                    <LastLabel isNotCreator={isCreator?.myId === isCreator.creatorId}>
                      팀원
                    </LastLabel>
                    {/* 팀원일 때 보여질 팀원 리스트 */}
                    <Flex flexDirection="column">
                      {isCreator?.myId !== isCreator.creatorId && (
                        <MemberWrapperMemberView>
                          {members.map((member, index) => (
                            <Member key={index}>
                              <MemberImage src={userDefault} alt="기본 프로필 사진"></MemberImage>
                              <MemberEmail>{member}</MemberEmail>
                              <MemberState>초대</MemberState>
                            </Member>
                          ))}
                          {joinMembers?.map((member, index) => (
                            <Member key={index}>
                              <MemberInfo
                                onClick={() => {
                                  String(isCreator.myId) === String(member.id)
                                    ? onMypage()
                                    : onFriendPage(member.id);
                                }}
                              >
                                <MemberImage src={member.picture} alt="프로필 사진"></MemberImage>
                                <MemberEmail>{member.name}</MemberEmail>
                              </MemberInfo>
                              <MemberState>
                                {member.id !== isCreator.creatorId ? '멤버' : '방장'}
                              </MemberState>
                            </Member>
                          ))}
                        </MemberWrapperMemberView>
                      )}
                    </Flex>
                    {/* 방장일 때 작성할 팀원 초대 이메일 (1) */}
                    {isCreator?.myId === isCreator.creatorId && (
                      <>
                        <Input
                          type="text"
                          placeholder="이메일 혹은 닉네임#고유번호"
                          width="15rem"
                          value={emailInput}
                          onChange={handleEmailInput}
                        />
                        <InvitedBtn onClick={handleAddMember}>초대</InvitedBtn>
                      </>
                    )}
                  </RowWrapper>

                  {/* 방장일 때 보여질 멤버 리스트 (2)  */}
                  {isCreator?.myId === isCreator.creatorId && (
                    <MemberWrapper>
                      {members.map((member, index) => (
                        <Member key={index}>
                          <MemberImage src={userDefault} alt="기본 프로필 사진"></MemberImage>
                          <MemberEmail>{member}</MemberEmail>
                          <MemberState>초대</MemberState>
                        </Member>
                      ))}
                      {joinMembers?.map((member, index) => (
                        <Member key={index}>
                          <MemberInfo
                            onClick={() => {
                              String(isCreator.myId) === String(member.id)
                                ? onMypage()
                                : onFriendPage(member.id);
                            }}
                          >
                            <MemberImage src={member.picture} alt="프로필 사진"></MemberImage>
                            <MemberEmail>{member.name}</MemberEmail>
                          </MemberInfo>
                          <MemberState>
                            {member.id !== isCreator.creatorId ? '멤버' : '방장'}
                          </MemberState>
                        </Member>
                      ))}
                    </MemberWrapper>
                  )}
                </Flex>
              </Flex>
            </CreateForm>

            {isCreator?.myId === isCreator.creatorId && (
              <SubmitBtn onClick={submitTeamDashboard}>
                팀원 초대 및 대시보드 {dashboardId ? '수정' : '생성'}
              </SubmitBtn>
            )}

            {dashboardId && isCreator?.myId === isCreator.creatorId && (
              <DelBtn onClick={submitDelDashboard}>대시보드 삭제</DelBtn>
            )}
            {dashboardId && isCreator?.myId !== isCreator.creatorId && (
              <DelBtn onClick={submitQuitDashboard}>대시보드 탈퇴</DelBtn>
            )}
          </CreateDashBoardModal>
        </CreateDashBoardContainer>

        {/* 작성되지 않은 부분이 있으면 모달창으로 알림 */}
        {isModalOpen && isEmptyModalOpen && (
          <CustomModal
            title="모든 칸을 작성해주세요."
            subTitle="잠깐! 작성되지 않은 칸이 있습니다."
            onYesClick={handleYesClick}
            onNoClick={handleNoClick}
          />
        )}

        {/* 삭제 동의 모달창 */}
        {isModalOpen && isDelModalOpen && (
          <CustomModal
            title="대시보드를 삭제하시겠습니까?"
            subTitle="한 번 삭제된 대시보드는 되돌릴 수 없습니다."
            onYesClick={handleYesClick}
            onNoClick={handleNoClick}
          />
        )}

        {/* 탈퇴 동의 모달창 */}
        {isModalOpen && isQuitModalOpen && (
          <CustomModal
            title="팀 대시보드를 탈퇴하시겠습니까?"
            subTitle="탈퇴 후 다시 초대를 받으면 팀원이 되실 수 있습니다."
            onYesClick={handleYesClick}
            onNoClick={handleNoClick}
          />
        )}

        {/* 초대 알람이 가지 않았을 때 창 끌 때 동의 모달창 */}
        {isModalOpen && isBackModalOpen && (
          <CustomModal
            title="팀원 초대를 취소하시겠습니까?"
            subTitle="대시보드를 저장해주세요."
            onYesClick={handleYesClick}
            onNoClick={handleNoClick}
          />
        )}
      </CreateDashBoardLayout>
    </>
  );
};

export default CreateTeamBoard;

/*
todo: 팀 대시보드 삭제 코드는 완료. 팀 대시보드 get, patch 추가 해야 함.
?? 팀 수정 코드는 있는데 patch 함수 호출하면 에러남. 500 에러. memberList때문에 그런건가?
*/
