import React, { useState } from 'react'
import { DEFAULT_COLOR, ONE_MINUTE_HEIGHT } from '../../store/constants'
import { timeUtil } from '../../utils'
import RecordEditModal from './RecordEditModal'

const Record = (props) => {
  const { userColor, start, end, title } = props

  const [modal, setModal] = useState(false)

  const top = timeUtil.convertToMin(start) * ONE_MINUTE_HEIGHT + 'px'
  const height =
    (timeUtil.convertToMin(end) - timeUtil.convertToMin(start)) *
    ONE_MINUTE_HEIGHT

  const style = {
    boxLeft: {
      width: '7px',
      backgroundColor: userColor?.color.hex || DEFAULT_COLOR.hex,
    },
    boxRight: {
      width: '100%',
      padding: '4px 8px',
      backgroundColor: (userColor?.color.hex || DEFAULT_COLOR.hex) + '4d',
      color: userColor?.color.hex || DEFAULT_COLOR.hex,
    },
  }

  return (
    <>
      <div className="absolute w-full p-1" style={{ top }}>
        <div
          className="z-50 flex cursor-pointer rounded-lg hover:shadow-lg"
          style={{ height: height < 25 ? '25px' : height + 'px' }}
          onClick={() => setModal(!modal)}
        >
          <div style={style.boxLeft} className="rounded-l-lg" />
          <div
            style={style.boxRight}
            className={
              'overflow-hidden rounded-r-lg ' +
              (height < 45 && 'flex items-center')
            }
          >
            <p className={'font-bold ' + (height < 45 && 'mr-2')}>{title}</p>
            <p className="text-xs">
              {start} ~ {end}
            </p>
          </div>
        </div>
      </div>

      {modal && (
        <RecordEditModal modal={modal} setModal={setModal} recordData={props} />
      )}
    </>
  )
}

export default Record
