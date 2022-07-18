import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Tabs, Input } from 'antd'
import './header.css'

const { TabPane } = Tabs

export default class Header extends Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      prevPage: 1,
    }
  }

  componentDidMount() {
    this.inputRef.current.focus()
  }

  componentDidUpdate(prevProps) {
    const { selectedTab } = this.props
    if (selectedTab !== prevProps.selectedTab && selectedTab === 'search') {
      this.inputRef.current.focus()
    }
  }

  onTabSelect = (key) => {
    const { paginationHandler, selectedTabHandler, pageNumber } = this.props
    const { prevPage } = this.state
    selectedTabHandler(key)
    paginationHandler(prevPage)
    this.setState({ prevPage: pageNumber })
    console.log('prevPage', prevPage)
  }

  render() {
    const { inputHandler, inputValue, selectedTab } = this.props
    return (
      <header className="header">
        <Tabs activeKey={selectedTab} centered onChange={this.onTabSelect}>
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

Header.defaultProps = {
  selectedTab: 'search',
  inputValue: '',
}

Header.propTypes = {
  inputValue: PropTypes.string,
  selectedTab: PropTypes.string,
  inputHandler: PropTypes.func.isRequired,
  selectedTabHandler: PropTypes.func.isRequired,
}
