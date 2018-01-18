import React from 'react';
import Reflux from 'reflux';
import classNames from 'classnames';

import createReactClass from 'create-react-class';

import ApiMixin from '../../mixins/apiMixin';

import {update as projectUpdate} from '../../actionCreators/projects';

import LatestContextStore from '../../stores/latestContextStore';

const BookmarkToggle = createReactClass({
  displayName: 'BookmarkToggle',

  mixins: [ApiMixin, Reflux.listenTo(LatestContextStore, 'onLatestContextUpdate')],

  getInitialState() {
    return {
      orgId: null,
      project: null,
    };
  },

  handleBookmarkClick() {
    let {project, orgId} = this.state;
    if (project) {
      projectUpdate(this.api, {
        orgId,
        projectId: project.slug,
        data: {
          isBookmarked: !project.isBookmarked,
        },
      });
    }
  },

  onLatestContextUpdate(context) {
    let project = context.project || null;
    let orgId = context.organization ? context.organization.slug : null;
    this.setState({project, orgId});
  },

  render() {
    // TODO: can't guarantee that a <span> is appropriate here 100% of the time
    //       if this is to be truly re-usable

    let isActive = this.state.project ? this.state.project.isBookmarked : false;

    let projectIconClass = classNames('project-select-bookmark icon icon-star-solid', {
      active: isActive,
    });

    return (
      <span onClick={this.handleBookmarkClick}>
        <a className={projectIconClass} />
      </span>
    );
  },
});

export default BookmarkToggle;
