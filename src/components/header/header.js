import './header.css'

import { Tabs, Input } from 'antd'
import React, { Component } from 'react'

const { TabPane } = Tabs

export default class Header extends Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
  }

  componentDidMount() {
    this.inputRef.current.focus()
  }

  render() {
    const { inputHandler, inputValue, selectedTab, selectedTabHandler } = this.props
    return (
      <header className="header">
        <Tabs activeKey={selectedTab} centered onChange={(key) => selectedTabHandler(key)}>
          <TabPane tab="Search" key="search">
            <Input
              ref={this.inputRef}
              className="header__search"
              placeholder="Type to search..."
              value={inputValue}
              onChange={(e) => inputHandler(e.target.value)}
            />
          </TabPane>
          <TabPane tab="Rated" key="rated" />
        </Tabs>
      </header>
    )
  }
}
