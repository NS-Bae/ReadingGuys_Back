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
  구독결제성공 = 'paid-success',
  구독결제실패 = 'paid-failed',
  로그아웃 = 'log-out',
  학원삭제성공 = 'academy-delete-success',
  학원삭제실패 = 'academy-delete-failed',
  약관동의성공 = 'agreement-success',
  약관동의실패 = 'agreement-failed',
  회원상태변경성공 = 'user-paid-status-change-success',//여기부터
  회원상태변경실패 = 'user-paid-status-change-failed',
  학원상태변경성공 = 'academy-paid-status-change-success',
  학원상태변경실패 = 'academy-paid-status-change-failed',
  신규학원등록성공 = 'regist-new-academy-success',
  신규학원등록실패 = 'regist-new-academy-failed',
  신규사용자등록성공 = 'regist-new-user-success',
  신규사용자등록실패 = 'regist-new-user-failed',
  관리자인증실패 = 'validate-failed',
  관리자인증성공 = 'validate-success',
  로그인실패 = 'log-in-failed',
  회원삭제성공 = 'user-delete-success',
  회원삭제실패 = 'user-delete-failed',
  결과저장실패 = 'save-record-failed',
  교재다운로드실패 = 'download-book-failed',
  교재업로드실패 = 'upload-book-failed',
  교재삭제성공 = 'delete-book-success',
  교재삭제실패 = 'delete-book-failed',
  교재상태변경성공 = 'book-paid-status-change-success',
  교재상태변경실패 = 'book-paid-status-change-failed',
}

export enum TermsTypes {
  이용약관 = 'service',
  개인정보 = 'privacy'
}