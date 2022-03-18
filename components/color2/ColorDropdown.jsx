import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Dropdown from '../micro/Dropdown'
import { DEFAULT_COLOR } from '../../store/constants'
import { useRecoilValueLoadable } from 'recoil'
import { categoriesData } from '../../store/common'

const ColorDropdown = ({ defaultColor, handleColorClick, style }) => {
  const email = useSession().data.user.email
  const categories = useRecoilValueLoadable(categoriesData(email))
  console.log(categories)

  const [outerList, setOuterList] = useState({ id: '', state: false })
  const [innerList, setInnerList] = useState({ id: '', state: false })

  // 내부 드롭다운 안에 아이템 (= 컬러 목록)
  const renderInnerList = (id) =>
    categories.state === 'hasValue' &&
    categories.contents
      .find((category) => category.id === id)
      .userColors.map((colorInfo, i) => (
        <div className="flex items-center" key={i}>
          <div
            className="mr-2 h-4 w-4 rounded-full"
            style={{ backgroundColor: colorInfo.color.hex + '4d' }}
          />
          <div
            onClick={() => {
              handleColorClick(colorInfo)
              setOuterList({ id: '', state: false })
            }}
            className="flex-1 cursor-pointer p-2 text-sm hover:bg-gray-50"
          >
            {colorInfo.tag}
          </div>
        </div>
      ))

  // 내부 드롭다운 열리기 전 프리뷰 (카테고리명)
  const renderPreviewCategory = (categoryName) => (
    <p className={style?.inside?.title}>{categoryName}</p>
  )

  // 외부 드롭다운
  const renderOuterList = () =>
    categories.state === 'hasValue' &&
    categories.contents.map((category, i) => (
      <Dropdown
        key={i}
        id={category.id}
        open={innerList}
        setOpen={setInnerList}
        before="8"
        after="56"
        preview={renderPreviewCategory(category.categoryName)}
        style={style?.inside}
        contents={renderInnerList(category.id)}
        contentHeight="56"
      />
    ))

  // 외부 드롭다운 열기 전 프리뷰 (컬러)
  const renderPreviewColor = () => {
    return (
      <>
        <div
          className="mr-2 h-4 w-4 rounded-full"
          style={{ backgroundColor: defaultColor.color.hex + '4d' }}
        />
        <div className={style?.outside?.title}>{defaultColor.tag}</div>
      </>
    )
  }

  return (
    <>
      <Dropdown
        id=""
        open={outerList}
        setOpen={setOuterList}
        before="8"
        after="64"
        style={style?.outside}
        preview={renderPreviewColor()}
        contents={renderOuterList()}
        contentHeight="56"
      />
    </>
  )
}

export default ColorDropdown