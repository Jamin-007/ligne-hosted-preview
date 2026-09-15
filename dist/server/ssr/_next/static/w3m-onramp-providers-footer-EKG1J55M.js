import{G as e,L as t,N as n,Q as r,g as i,k as a}from"./W3MFrameProviderSingleton-HZYm1xhS.js";import{f as o,g as s,i as c,l,o as u,t as d,x as f}from"./exports-C_Yj_olO.js";import{s as p}from"./wui-text-DGOaezhb.js";import"./wui-icon-Cn6lXW8X.js";import"./wui-link-D9BFVd_F.js";var m=`https://reown.com`,h=l`
  .reown-logo {
    height: 24px;
  }

  a {
    text-decoration: none;
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  a:hover {
    opacity: 0.9;
  }
`,g=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},_=class extends o{render(){return s`
      <a
        data-testid="ux-branding-reown"
        href=${m}
        rel="noreferrer"
        target="_blank"
        style="text-decoration: none;"
      >
        <wui-flex
          justifyContent="center"
          alignItems="center"
          gap="1"
          .padding=${[`01`,`0`,`3`,`0`]}
        >
          <wui-text variant="sm-regular" color="inherit"> UX by </wui-text>
          <wui-icon name="reown" size="inherit" class="reown-logo"></wui-icon>
        </wui-flex>
      </a>
    `}};_.styles=[u,c,h],_=g([d(`wui-ux-by-reown`)],_);var v=l`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`,y=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},b=class extends o{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=e.state.remoteFeatures,this.unsubscribe.push(e.subscribeKey(`remoteFeatures`,e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state,r=e.state.features?.legalCheckbox;return!t&&!n||r?s`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:s`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${[`4`,`3`,`3`,`3`]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state;return t&&n?`and`:``}termsTemplate(){let{termsConditionsUrl:t}=e.state;return t?s`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:t}=e.state;return t?s`<a href=${t} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?s`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:s`<wui-ux-by-reown></wui-ux-by-reown>`:null}};b.styles=[v],y([p()],b.prototype,`remoteFeatures`,void 0),b=y([d(`w3m-legal-footer`)],b);var x=f``,S=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},C=class extends o{render(){let{termsConditionsUrl:t,privacyPolicyUrl:n}=e.state;return!t&&!n?null:s`
      <wui-flex
        .padding=${[`4`,`3`,`3`,`3`]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `}howDoesItWorkTemplate(){return s` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){t.sendEvent({type:`track`,event:`SELECT_WHAT_IS_A_BUY`,properties:{isSmartAccount:a(i.state.activeChain)===r.ACCOUNT_TYPES.SMART_ACCOUNT}}),n.push(`WhatIsABuy`)}};C.styles=[x],C=S([d(`w3m-onramp-providers-footer`)],C);