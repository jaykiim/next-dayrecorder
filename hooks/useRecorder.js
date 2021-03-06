import { useEffect } from 'react'
import { useRecoilState, useRecoilStateLoadable } from 'recoil'
import { useSession } from 'next-auth/react'
import { isRecording, recordsData } from '../store/common'
import { recordCalls } from '../apiCalls'
import { dateUtil, timeUtil } from '../utils'

export function useRecorder() {
  // 현재 레코딩 중인지 (전역 상태)
  const [recording, setRecording] = useRecoilState(isRecording)

  // 컴포넌트 마운트 시 로컬 스토리지 확인 후 recording 값 변경
  useEffect(() => {
    window.localStorage.getItem('recording')
      ? setRecording(true)
      : setRecording(false)
  }, [])

  const user = useSession().data.user

  // 오늘 날짜의 레코드 데이터 상태를 가져오기 위해서 datestamp를 구한다
  const datestamp = dateUtil.dateConverter({
    date: new Date(),
    to: 'yyyy-mm-dd',
  })

  // 레코드 데이터 상태
  const [records, setRecords] = useRecoilStateLoadable(
    recordsData({ datestamp, email: user.email })
  )

  /* ============================================================================================================================================
    // TODO 레코딩 시작
  ============================================================================================================================================ */

  const startRecording = ({ title, color, setModal, todoId }) => {
    setRecording(true)

    window.localStorage.setItem(
      'recording',
      JSON.stringify({
        start: timeUtil.getCurrentTime(),
        title,
        color,
        date: datestamp,
        todoId,
      })
    )

    setModal && setModal(false)
  }

  /* ============================================================================================================================================
    // TODO 레코딩 종료
  ============================================================================================================================================ */

  const stopRecording = async () => {
    setRecording(false)

    // 시작할 때 저장해두었던 정보 가져오기
    const saved = JSON.parse(window.localStorage.getItem('recording'))
    if (!saved) return

    // 끝난 시간
    const endTime = timeUtil.getCurrentTime()

    // 끝난 날짜
    const endDate = dateUtil.dateConverter({
      date: new Date(),
      to: 'yyyy-mm-dd',
    })

    // 레코드 객체 생성기
    const createRecordData = ({ date, start, end }) => ({
      // 파라미터로 받은 값 사용 : 날짜, 시작시각, 종료시각
      date,
      start,
      end,

      // 레코딩 시작 시 설정한 값 사용 : 제목, 컬러, 카테고리
      title: saved.title,
      colorId: saved.color?.id,
      categoryId: saved.color?.userCategory.id,

      // 입력받지 않은 값
      memo: '',

      // 유저 정보
      email: user.email,
    })

    // * 시작 날짜와 끝난 날짜가 다를 경우
    if (saved.date !== endDate) {
      // 시작 날짜 ~ 23:59
      const record1 = createRecordData({
        date: saved.date,
        start: saved.start,
        end: '23:59',
      })

      // 끝난 날짜 00:00 ~ 끝난 시각
      const record2 = createRecordData({
        date: endDate,
        start: '00:00',
        end: endTime,
      })

      // DB에 저장하고나서 응답으로 오는 데이터에 id가 포함되어 있으므로, 응답을 받고 난 다음에 setRecords를 해줘야한다
      const { createdRecord: record1Res } = await recordCalls.createRecordReq(
        record1
      )
      const { createdRecord: record2Res } = await recordCalls.createRecordReq(
        record2
      )

      setRecords((records) => [...records, record1Res, record2Res])
    }

    // 시작 날짜와 끝난 날짜가 같으면
    else {
      const newRecord = createRecordData({
        date: endDate,
        start: saved.start,
        end: endTime,
      })

      const { createdRecord } = await recordCalls.createRecordReq(newRecord)

      setRecords((records) => [...records, createdRecord])
    }

    // 로컬 스토리지 지우기
    window.localStorage.removeItem('recording')
  }

  return { recording, setRecording, startRecording, stopRecording }
}
