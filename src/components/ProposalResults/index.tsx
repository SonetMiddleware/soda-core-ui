import React, { useMemo } from 'react'
import './index.less'
import { Progress } from 'antd'
interface IProps {
  items: string[]
  results: number[]
}

export default (props: IProps) => {
  const { items = [], results = [] } = props
  const ProgressColors = ['#9D5FE9', '#F8C35D']

  const percents = useMemo(() => {
    const total = results.reduce((a, b) => a + b, 0)
    if (total > 0) {
      return results.map((item) => Math.floor((item * 100) / total))
    } else {
      return results.map((item) => 0)
    }
  }, [results])

  return (
    <div className="proposal-results-container">
      <p className="title">Current Results</p>

      {items.map((item, index) => (
        <div className="vote-item" key={index}>
          <div className="vote-data-container">
            <p className="vote-desc">{item}</p>
            <div className="vote-data">
              <p>{percents[index] + '%'}</p>
            </div>
          </div>
          <Progress
            percent={percents[index]}
            showInfo={false}
            className="custom-progress"
            strokeColor={ProgressColors[index % 2]}
          />
          <p className="vote-nums">{results[index]} Votes</p>
        </div>
      ))}
    </div>
  )
}
