import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import {t, tct} from '../locale';
import AlertActions from '../actions/alertActions';
import ApiMixin from '../mixins/apiMixin';
import LoadingError from '../components/loadingError';
import LoadingIndicator from '../components/loadingIndicator';
import Panel from './settings/components/panel';
import PanelBody from './settings/components/panelBody';
import PanelHeader from './settings/components/panelHeader';
import PluginList from '../components/pluginList';
import SentryTypes from '../proptypes';
import SettingsPageHeader from './settings/components/settingsPageHeader';
import TextBlock from './settings/components/text/textBlock';
import withPlugins from '../utils/withPlugins';

const ProjectReleaseTracking = createReactClass({
  displayName: 'ProjectReleaseTracking',

  propTypes: {
    organization: PropTypes.object,
    project: PropTypes.object,
    plugins: SentryTypes.PluginsStore,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      webhookUrl: '',
      token: '',
    };
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchData() {
    let {orgId, projectId} = this.props.params;

    this.api.request(`/projects/${orgId}/${projectId}/releases/token/`, {
      method: 'GET',
      success: data =>
        this.setState({
          webhookUrl: data.webhookUrl,
          token: data.token,
        }),
      error: () => {
        this.setState({
          error: true,
        });
      },
      complete: () => {
        this.setState({loading: false});
      },
    });
  },

  onSubmit(evt) {
    evt.preventDefault();
    this.regenerateToken();
  },

  regenerateToken() {
    let {orgId, projectId} = this.props.params;
    this.api.request(`/projects/${orgId}/${projectId}/releases/token/`, {
      method: 'POST',
      data: {project: projectId},
      success: data => {
        this.setState({
          token: data.token,
          webhookUrl: data.webhookUrl,
        });
        AlertActions.addAlert({
          message: t(
            'Your deploy token has been regenerated. You will need to update any pre-existing deploy hooks.'
          ),
          type: 'success',
        });
      },
      error: () => {
        this.setState({
          error: true,
        });
      },
    });
  },

  getReleaseWebhookIntructions() {
    let webhookUrl = this.state.webhookUrl;
    return (
      'curl ' +
      webhookUrl +
      ' \\' +
      '\n  ' +
      '-X POST \\' +
      '\n  ' +
      "-H 'Content-Type: application/json' \\" +
      '\n  ' +
      '-d \'{"version": "abcdefg"}\''
    );
  },

  getReleaseClientConfigurationIntructions() {
    return (
      '// See SDK documentation for language specific usage.' +
      '\n' +
      "Raven.config('your dsn', {" +
      '\n' +
      '  ' +
      "release: '0e4fdef81448dcfa0e16ecc4433ff3997aa53572'" +
      '\n' +
      '});'
    );
  },

  render() {
    let {organization, project, plugins} = this.props;

    if (this.state.loading || plugins.loading)
      return (
        <div className="box">
          <LoadingIndicator />
        </div>
      );
    else if (this.state.error) return <LoadingError onRetry={this.fetchData} />;

    let pluginList = plugins.plugins.filter(
      p => p.type === 'release-tracking' && p.hasConfiguration
    );

    return (
      <div>
        <SettingsPageHeader title={t('Release Tracking')} />
        <TextBlock>
          {t(
            'Configure release tracking for this project to automatically record new releases of your application.'
          )}
        </TextBlock>

        <Panel>
          <PanelHeader>{t('Client Configuration')}</PanelHeader>
          <PanelBody disablePadding={false} flex>
            <p>
              {tct('Start by binding the [release] attribute in your application:', {
                release: <code>release</code>,
              })}
            </p>
            <pre>{this.getReleaseClientConfigurationIntructions()}</pre>
            <p>
              {t(
                "This will annotate each event with the version of your application, as well as automatically create a release entity in the system the first time it's seen."
              )}
            </p>
            <div>
              {t(
                'In addition you may configure a release hook (or use our API) to push a release and include additional metadata with it.'
              )}
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>{t('Token')}</PanelHeader>
          <PanelBody disablePadding={false} flex>
            <form>
              <p>
                {t(
                  'Your token is a unique secret which is used to generate deploy hook URLs. If a service becomes compromised, you should regenerate the token and re-configure any deploy hooks with the newly generated URL.'
                )}
              </p>
              <p>
                <code style={{display: 'inlineBlock'}} className="auto-select">
                  {this.state.token}
                </code>
              </p>
              <div>
                <button
                  type="submit"
                  className="btn btn-sm btn-danger"
                  name="op"
                  value="regenerate-token"
                  onClick={this.onSubmit}
                >
                  {t('Regenerate Token')}
                </button>
              </div>
            </form>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>{t('Webhook')}</PanelHeader>
          <PanelBody disablePadding={false} flex>
            <form>
              <p>
                {t(
                  'If you simply want to integrate with an existing system, sometimes its easiest just to use a webhook.'
                )}
              </p>

              <pre className="auto-select">{this.state.webhookUrl}</pre>

              <p>
                {t(
                  'The release webhook accepts the same parameters as the "Create a new Release" API endpoint, for example:'
                )}
              </p>

              <pre style={{margin: 0}} className="auto-select">
                {this.getReleaseWebhookIntructions()}
              </pre>
            </form>
          </PanelBody>
        </Panel>

        <PluginList
          organization={organization}
          project={project}
          pluginList={pluginList}
        />

        <Panel>
          <PanelHeader>{t('API')}</PanelHeader>
          <PanelBody disablePadding={false} flex>
            <p>
              {t(
                'You can notify Sentry when you release new versions of your application via our HTTP API.'
              )}
            </p>

            <div>
              {t('See the ')}
              <a href="https://docs.sentry.io/hosted/api/releases/">
                {t('Releases API documentation')}
              </a>{' '}
              {t('for more information.')}
            </div>
          </PanelBody>
        </Panel>
      </div>
    );
  },
});

export default withPlugins(ProjectReleaseTracking);
