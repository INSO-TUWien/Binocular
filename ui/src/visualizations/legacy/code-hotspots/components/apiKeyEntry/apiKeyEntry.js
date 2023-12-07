import React from 'react';
import styles from '../../styles.module.scss';
import apiKeyEntryStyles from './apiKeyEntry.module.scss';

export default class ApiKeyEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { setApiKey } = this.props;
    return (
      <div className={apiKeyEntryStyles.window}>
        <div className={apiKeyEntryStyles.label}>Enter GitLab API Key:</div>
        <input className={'input ' + apiKeyEntryStyles.textField} id={'gitlabSettingsApiKeyEntry'} type="text" placeholder={'API Key'} />
        <button
          className={'button ' + apiKeyEntryStyles.button}
          onClick={(e) => {
            setApiKey(document.getElementById('gitlabSettingsApiKeyEntry').value);
          }}>
          Set API Key
        </button>
      </div>
    );
  }
}
