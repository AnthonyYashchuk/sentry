import Reflux from 'reflux';

import ProjectActions from '../actions/projectActions';
import OrganizationsActions from '../actions/organizationsActions';
import EnvironmentActions from '../actions/environmentActions';

// Keeps track of last usable project/org
// this currently won't track when users navigate out of a org/project completely,
// it tracks only if a user switches into a new org/project
//
// Only keep slug so that people don't get the idea to access org/project data here
// Org/project data is currently in organizationsStore/projectsStore
const LatestContextStore = Reflux.createStore({
  getInitialState() {
    return this.state;
  },

  init() {
    this.reset();
    this.listenTo(ProjectActions.setActive, this.onSetActiveProject);
    this.listenTo(OrganizationsActions.setActive, this.onSetActiveOrganization);
    this.listenTo(OrganizationsActions.update, this.onUpdateOrganization);
    this.listenTo(EnvironmentActions.setActive, this.onSetActiveEnvironment);
    this.listenTo(EnvironmentActions.clearActive, this.onClearActiveEnvironment);
  },

  reset() {
    this.state = {
      project: null,
      organization: null,
      environment: null,
    };
    return this.state;
  },

  onUpdateOrganization(org) {
    // Don't do anything if base/target orgs are falsey
    if (!this.state.organization) return;
    if (!org) return;
    // Check to make sure current active org is what has been updated
    if (org.slug !== this.state.organization.slug) return;

    this.state.organization = {...org};
    this.trigger(this.state);
  },

  onSetActiveOrganization(org) {
    if (!org) {
      this.state.organization = null;
    } else if (!this.state.organization || this.state.organization.slug !== org.slug) {
      // Update only if different
      this.state.organization = {...org};
    }

    this.trigger(this.state);
  },

  onSetActiveProject(project) {
    if (!project) {
      this.state.project = null;
    } else if (!this.state.project || this.state.project.slug !== project.slug) {
      // Update only if different
      this.state.project = {...project};
      this.state.environment = null;
    }

    this.trigger(this.state);
  },

  onSetActiveEnvironment(environment) {
    this.state.environment = environment;

    this.trigger(this.state);
  },

  onClearActiveEnvironment() {
    this.state.environment = null;
    this.trigger(this.state);
  },
});

export default LatestContextStore;
