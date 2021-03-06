import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import ColorDropdown from '../micro/ColorDropdown'

const RecordCreateModal = ({ setModal, startRecording, cb }) => {
  const categories = useSession().data.user.categories
  const [color, setColor] = useState(categories[0].userColors[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    startRecording({ title: e.target.value, color, setModal })
    if (cb) cb()
  }

  return (
    <div className="absolute top-10 right-0 z-10 h-32 w-64 rounded-md border border-green-900 bg-green-300 p-5 shadow-md md:bg-gray-50">
      <div className="absolute z-20" style={{ width: '215px' }}>
        <ColorDropdown color={color} setColor={setColor} />
      </div>
      <input
        type="text"
        className="inputUnderline absolute border-green-700 py-1 text-sm"
        autoFocus={true}
        style={{ width: '215px', top: '75px' }}
        placeholder="일정 제목을 입력 후 Enter"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
      />
    </div>
  )
}

export default RecordCreateModal
