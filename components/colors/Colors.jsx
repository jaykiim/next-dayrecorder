import React from 'react'
import { useSession } from 'next-auth/react'
import { useRecoilStateLoadable } from 'recoil'
import { categoriesData } from '../../store/common'
import Title from '../micro/Title'
import CategoryDropdown from './CategoryDropdown'
import ColorForm from './ColorForm'
import ColorList from './ColorList'

const Colors = () => {
  const email = useSession().data.user.email
  const [categories, setCategories] = useRecoilStateLoadable(
    categoriesData(email)
  )

  return (
    <>
      {categories.state === 'hasValue' && (
        <>
          <Title title="Colors" />
          <section className="bodyContainer">
            <CategoryDropdown
              email={email}
              categories={categories.contents}
              setCategories={setCategories}
            />
            <ColorForm
              email={email}
              categories={categories.contents}
              setCategories={setCategories}
            />
            <ColorList
              categories={categories.contents}
              setCategories={setCategories}
            />
          </section>
        </>
      )}
    </>
  )
}

export default Colors
