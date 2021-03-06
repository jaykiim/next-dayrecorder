import axios from 'axios'
import { gql } from 'graphql-request'
import { graphcmsClient } from '../lib/graphcms'
import { hash } from 'bcryptjs'
import colorCalls from './colorCalls'

export const createUserByEmail = gql`
  mutation createUserByEmail(
    $username: String!
    $email: String!
    $password: String
  ) {
    newUser: createDayrecorderUser(
      data: { username: $username, email: $email, password: $password }
    ) {
      email
      username
    }
  }
`

export const createInitialCategory = async (email) => {
  try {
    const { createdCategory } = await colorCalls.createUserCategoryReq({
      categoryName: '미분류',
      email,
    })

    await colorCalls.createUserColorReq({
      hex: '#e5e5e5',
      tag: '미정',
      email,
      categoryId: createdCategory.id,
    })

    return createdCategory
  } catch (err) {
    console.log(err)
  }
}

export const createUserByEmailReq = async (credentials, userInfo) => {
  try {
    // 로컬 가입
    if (credentials) {
      const { username, email, password } = credentials
      const { newUser } = await graphcmsClient.request(createUserByEmail, {
        username,
        email,
        password: await hash(password, 12),
      })
      await createInitialCategory(email)
      return newUser
    }

    // 소셜 가입
    else {
      const { name: username, email } = userInfo

      // 유저 DB 등록
      await graphcmsClient.request(createUserByEmail, {
        username,
        email,
      })

      // 초기 카테고리 생성
      const userCategory = await createInitialCategory(email)

      return userCategory
    }
  } catch (err) {
    console.log(err)
  }
}

export const getUserByEmail = gql`
  query getUserByEmail($email: String!) {
    user: dayrecorderUser(where: { email: $email }) {
      email
      password
      username
      phone
      userCategory {
        id
        categoryName
        userColors {
          color {
            hex
          }
          id
          tag
          userCategory {
            id
            categoryName
          }
        }
      }
    }
  }
`

export const getUserByEmailReq = async (email) => {
  try {
    const { user } = await graphcmsClient.request(getUserByEmail, { email })
    return user
  } catch (err) {
    console.log(err)
  }
}

export const sendEmail = async (userEmail, setVerificationCode) => {
  const { data: verificationCode } = await axios.post(
    'api/auth/verificationMail',
    {
      mail: userEmail,
    }
  )
  setVerificationCode(verificationCode)
}

export const sendSmsCode = async (phoneNumber) => {
  try {
    const { data: verificationCode } = await axios.post(
      'api/auth/verificationSms',
      { phoneNumber: '+82' + phoneNumber.slice(1) }
    )
    return verificationCode
  } catch (err) {
    console.log(err)
  }
}

export const changePassword = gql`
  mutation changePassword($password: String!, $email: String!) {
    updateDayrecorderUser(
      data: { password: $password }
      where: { email: $email }
    ) {
      email
    }
  }
`

export const changePasswordReq = async (values) => {
  try {
    await graphcmsClient.request(changePassword, values)
  } catch (err) {
    console.log(err)
  }
}

export const updatePhoneNumber = gql`
  mutation updatePhoneNumber($phone: Int!, $email: String!) {
    updateDayrecorderUser(data: { phone: $phone }, where: { email: $email }) {
      phone
    }
  }
`

export const updatePhoneNumberReq = async (values) => {
  try {
    await graphcmsClient.request(updatePhoneNumber, values)
  } catch (err) {
    console.log(err)
  }
}

export const findAccountByPhone = gql`
  query findAccountByPhone($phone: Int!) {
    userInfo: dayrecorderUser(where: { phone: $phone }) {
      email
      phone
    }
  }
`

export const findAccountByPhoneReq = async (values) => {
  try {
    const { userInfo } = await graphcmsClient.request(
      findAccountByPhone,
      values
    )
    return userInfo
  } catch (err) {
    console.log(err)
  }
}
