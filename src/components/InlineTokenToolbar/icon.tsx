import React from 'react'

function IconShareTwitter(props: { disabled: boolean; onClick: () => void }) {
  const { disabled, onClick } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="12"
      fill="none"
      viewBox="0 0 15 12"
      onClick={() => {
        !disabled && onClick()
      }}>
      <path
        fill={disabled ? '#808191' : '#9D5FE9'}
        d="M14.779 2.082a5.687 5.687 0 01-1.63.447A2.847 2.847 0 0014.396.958a5.67 5.67 0 01-1.804.688 2.84 2.84 0 00-4.839 2.591A8.065 8.065 0 011.901 1.27a2.839 2.839 0 00-.049 2.768c.22.412.539.764.928 1.023a2.833 2.833 0 01-1.286-.355v.037a2.84 2.84 0 002.278 2.784 2.86 2.86 0 01-1.283.05 2.841 2.841 0 002.653 1.97 5.699 5.699 0 01-4.205 1.177A8.032 8.032 0 005.29 12c5.224 0 8.08-4.327 8.08-8.08a8.17 8.17 0 00-.008-.367 5.773 5.773 0 001.416-1.469v-.002z"></path>
    </svg>
  )
}

function IconShareFB(props: { disabled: boolean; onClick: () => void }) {
  const { disabled, onClick } = props
  return (
    <svg
      onClick={() => {
        !disabled && onClick()
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 13 13">
      <path
        fill={disabled ? '#808191' : '#9D5FE9'}
        fillRule="evenodd"
        d="M0 6.536C0 9.768 2.347 12.456 5.417 13V8.305H3.792V6.5h1.625V5.055c0-1.625 1.047-2.527 2.528-2.527.469 0 .975.072 1.444.144v1.661h-.83c-.795 0-.976.397-.976.903V6.5h1.734l-.289 1.805H7.583V13C10.653 12.455 13 9.768 13 6.536 13 2.941 10.075 0 6.5 0S0 2.941 0 6.536z"
        clipRule="evenodd"></path>
    </svg>
  )
}

export { IconShareTwitter, IconShareFB }
