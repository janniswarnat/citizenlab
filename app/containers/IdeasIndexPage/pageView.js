/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import WatchSagas from 'containers/WatchSagas';
import { Segment } from 'semantic-ui-react';
import IdeaCards from './components/ideaCards';

// store
import { preprocess } from 'utils';
import { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas } from './actions';
import sagasWatchers from './sagas';


class View extends React.Component {
  constructor(props) {
    super();
    const { location } = props;
    this.search = location.search;
    this.state = { visible: false };
  }

  componentDidMount() {
    this.props.loadTopicsRequest();
    this.props.loadAreasRequest();
    const { filter } = this.props;
    this.getideas(null, filter);
  }

  /* Component should update if new query params are provided */
  componentWillReceiveProps(nextProps) {
    const newSearch = nextProps.location.search;
    const isNewSearch = newSearch !== this.search;
    this.search = newSearch;
    if (isNewSearch) this.getideas(nextProps);
  }

  shouldComponentUpdate(props, { visible }) {
    const current = this.state.visible;
    return current !== visible;
  }

  componentWillUnmount() {
    this.props.resetIdeas();
  }

  getideas = (location, query) => {
    const data = location || this.props;
    const search = data.location.search;
    if (search) {
      this.props.filterIdeas(search, query);
    } else {
      this.props.loadIdeasRequest(true, null, null, null, query);
    }
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { filter } = this.props;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>
          <IdeaCards filter={filter} />
        </Segment>


        {/*
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <div style={{ display: 'table', lineHeight: 0, fontSize: '0', width: '100%' }}>
          <div
            style={{
              display: 'table-cell',
              width: '50px',
              height: '100%',
              overflow: 'visible',
              lineHeight: 0,
              fontSize: '0',
              marginTop: '5px',
              backgroundColor: '#1b1c1d',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Icon
                onClick={this.toggleVisibility}
                name={'bars'}
                style={{
                  verticalAlign: 'top',
                  fontSize: '26px',
                  lineHeight: '46px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>


          <LayoutSidebar.Pushable as={Segment} style={{ margin: '0', padding: '0', border: 'none', borderRadius: 0 }}>
            <Sidebar visible={visible} toggleVisibility={this.toggleVisibility} />
            <LayoutSidebar.Pusher>
              <Panel />
            </LayoutSidebar.Pusher>
          </LayoutSidebar.Pushable>
        </div>
        */}
      </div>
    );
  }
}

View.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

View.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  location: PropTypes.object,
  filterIdeas: PropTypes.func.isRequired,
  loadIdeasRequest: PropTypes.func.isRequired,
  resetIdeas: PropTypes.func.isRequired,
  filter: PropTypes.object,
};

View.defaultProps = {
  location: {},
};

const actions = { filterIdeas, loadIdeasRequest, loadTopicsRequest, loadAreasRequest, resetIdeas };

export default preprocess(null, actions)(View);
