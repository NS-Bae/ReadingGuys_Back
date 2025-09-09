export enum UserType {
  관리자 = '관리자',
  교사 = '교사',
  학생 = '학생',
}

export enum Difficulty {
  쉬움 = 'easy',
  보통 = 'normal',
  어려움 = 'hard',
}

export enum EventType {
  로그인 = 'log-in',
  교재업로드 = 'upload-book',
  교재다운로드 = 'download-book',
  시험시작 = 'start-exam',
  시험종료 = 'end-exam',
  결과저장 = 'save-record',
  구독결제 = 'paid',
  로그아웃 = 'log-out',
}

export enum TermsTypes {
  이용약관 = 'service',
  개인정보 = 'privacy'
}