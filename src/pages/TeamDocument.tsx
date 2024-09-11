import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import Flex from '../components/Flex';
import trash from '../img/delete2.png';
import closebutton from '../img/closebutton.png';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import {
  SideScreenContainer,
  SideScreen,
  StyledEditorWrapper,
  ImgWrapper,
  StatusBarContainer,
  DateContainer,
  TitleContainer,
  D_Day,
  StyledDatePicker,
  Input,
  CategoryContainer,
  InputCategory,
  RowWrapper,
} from '../styles/SidePageStyled';
import * as S from '../styles/TeamDocumentStyled';
import { useTeamDocument } from '../hooks/useTeamDocument';
import { BlockNoteView } from '@blocknote/mantine';
import useInterval from '../hooks/useInterval';
import { getPersonalBlock } from '../api/PersonalBlockApi';
import { BlockListResDto } from '../types/PersonalBlock';
import Navbar from '../components/Navbar';
import useInfo from '../hooks/useInfo';

const TeamDocument = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const segments = pathname.split('/');

  const teamDashboardId = segments[1]; // Assuming /48 is the teamDashboardId
  const teamDocumentId = segments[3]; // Assuming /15 is the teamDocumentId

  const { progress } = location.state || {};
  const { info } = useInfo();

  const { data, categories, handleInputChange, onChange, editor, SubmitData } = useTeamDocument(
    teamDashboardId,
    teamDocumentId,
    progress
  );

  console.log('전달받은 카테고리', categories);

  const toggleFunc = (event: React.MouseEvent) => {
    // SubmitData();
    navigate(-1);
    event.stopPropagation();
  };

  if (!editor) return <div>Loading editor...</div>;

  // 라우터 변경 감지 : 라우터 변경시 데이터 저장
  useBlocker(tx => {
    const { currentLocation, nextLocation } = tx;

    if (currentLocation.pathname !== nextLocation.pathname) {
      // SubmitData();
      return false;
    }
    return true;
  });

  return (
    <SideScreenContainer onClick={toggleFunc}>
      <SideScreen
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <ImgWrapper src={closebutton} alt="닫기 버튼" onClick={toggleFunc} />

        {/* 제목 입력 */}
        <TitleContainer>
          <Flex>
            <S.DocumentWriterImg>
              <img src={info?.data.picture} alt="프로필 사진" />
            </S.DocumentWriterImg>
            <S.DocumnetWriter>{info?.data.nickName}</S.DocumnetWriter>
          </Flex>
          <Input
            type="text"
            name="title"
            placeholder="제목을 입력하세요."
            value={data.title}
            onChange={handleInputChange}
          />
          <RowWrapper>
            <InputCategory
              type="text"
              name="category"
              placeholder="대시보드 카테고리를 설정해주세요."
              list="categoryList"
              value={data.category}
              onChange={handleInputChange}
            />
            <datalist id="categoryList">
              {categories.map((category, index) => (
                <option key={index} value={category} />
              ))}
            </datalist>
          </RowWrapper>
          <hr />
        </TitleContainer>

        {/* 본문 작성 */}
        <StyledEditorWrapper>
          <BlockNoteView editor={editor} onChange={onChange} />
        </StyledEditorWrapper>
      </SideScreen>
    </SideScreenContainer>
  );
};

export default TeamDocument;
