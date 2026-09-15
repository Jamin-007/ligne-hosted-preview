import{$ as e,L as t,N as n,S as r,V as i,W as a,_ as o,dt as s,g as c,gt as l,m as u,tt as d,x as f,z as p}from"./W3MFrameProviderSingleton-HZYm1xhS.js";import{f as m,g as h,i as g,l as _,o as v,r as y,t as b}from"./exports-C_Yj_olO.js";import{t as x}from"./SwapController-CIgCordu.js";import{c as S,o as C,s as w}from"./wui-text-DGOaezhb.js";import"./wui-button-ji6liv2F.js";import"./wui-icon-Cn6lXW8X.js";import"./wui-image-B4Ze9tnj.js";import"./wui-separator-DS5VUdXc.js";import{n as T,t as E}from"./ref-CSyTBJv1.js";import"./wui-link-D9BFVd_F.js";import"./wui-icon-box-BWGFHgZO.js";import"./wui-avatar-H8QqYAUM.js";import"./wui-list-token-BJaNPB27.js";import"./wui-input-text-S0RbU_qH.js";import"./wui-input-amount-Bf6QvgU9.js";import"./wui-token-button-D1ap0Ex6.js";var D=_`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:e})=>e[5]};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
    position: relative;
  }

  :host(:hover) {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    display: ruby;
    color: ${({tokens:e})=>e.theme.textPrimary};
    margin: 0 ${({spacing:e})=>e[2]};
  }

  .instruction {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }

  .paste {
    display: inline-flex;
  }

  textarea {
    background: transparent;
    width: 100%;
    font-family: ${({fontFamily:e})=>e.regular};
    font-style: normal;
    font-size: ${({textSize:e})=>e.large};
    font-weight: ${({fontWeight:e})=>e.regular};
    line-height: ${({typography:e})=>e[`lg-regular`].lineHeight};
    letter-spacing: ${({typography:e})=>e[`lg-regular`].letterSpacing};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    border: none;
    outline: none;
    appearance: none;
    resize: none;
    overflow: hidden;
  }
`,O=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},k=class extends m{constructor(){super(...arguments),this.inputElementRef=E(),this.instructionElementRef=E(),this.readOnly=!1,this.instructionHidden=!!this.value,this.pasting=!1,this.onDebouncedSearch=e.debounce(async t=>{if(!t.length){this.setReceiverAddress(``);return}let n=c.state.activeChain;if(e.isAddress(t,n)){this.setReceiverAddress(t);return}try{let e=await r.getEnsAddress(t);if(e){o.setReceiverProfileName(t),o.setReceiverAddress(e);let n=await r.getEnsAvatar(t);o.setReceiverProfileImageUrl(n||void 0)}}catch{this.setReceiverAddress(t)}finally{o.setLoading(!1)}})}firstUpdated(){this.value&&(this.instructionHidden=!0),this.checkHidden()}render(){return this.readOnly?h` <wui-flex
        flexDirection="column"
        justifyContent="center"
        gap="01"
        .padding=${[`8`,`4`,`5`,`4`]}
      >
        <textarea
          spellcheck="false"
          ?disabled=${!0}
          autocomplete="off"
          .value=${this.value??``}
        ></textarea>
      </wui-flex>`:h` <wui-flex
      @click=${this.onBoxClick.bind(this)}
      flexDirection="column"
      justifyContent="center"
      gap="01"
      .padding=${[`8`,`4`,`5`,`4`]}
    >
      <wui-text
        ${T(this.instructionElementRef)}
        class="instruction"
        color="secondary"
        variant="md-medium"
      >
        Type or
        <wui-button
          class="paste"
          size="md"
          variant="neutral-secondary"
          iconLeft="copy"
          @click=${this.onPasteClick.bind(this)}
        >
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
          Paste
        </wui-button>
        address
      </wui-text>
      <textarea
        spellcheck="false"
        ?disabled=${!this.instructionHidden}
        ${T(this.inputElementRef)}
        @input=${this.onInputChange.bind(this)}
        @blur=${this.onBlur.bind(this)}
        .value=${this.value??``}
        autocomplete="off"
      ></textarea>
    </wui-flex>`}async focusInput(){this.instructionElementRef.value&&(this.instructionHidden=!0,await this.toggleInstructionFocus(!1),this.instructionElementRef.value.style.pointerEvents=`none`,this.inputElementRef.value?.focus(),this.inputElementRef.value&&(this.inputElementRef.value.selectionStart=this.inputElementRef.value.selectionEnd=this.inputElementRef.value.value.length))}async focusInstruction(){this.instructionElementRef.value&&(this.instructionHidden=!1,await this.toggleInstructionFocus(!0),this.instructionElementRef.value.style.pointerEvents=`auto`,this.inputElementRef.value?.blur())}async toggleInstructionFocus(e){this.instructionElementRef.value&&await this.instructionElementRef.value.animate([{opacity:+!e},{opacity:+!!e}],{duration:100,easing:`ease`,fill:`forwards`}).finished}onBoxClick(){!this.value&&!this.instructionHidden&&this.focusInput()}onBlur(){!this.value&&this.instructionHidden&&!this.pasting&&this.focusInstruction()}checkHidden(){this.instructionHidden&&this.focusInput()}async onPasteClick(){this.pasting=!0;let e=await navigator.clipboard.readText();o.setReceiverAddress(e),this.focusInput()}onInputChange(e){let t=e.target;this.pasting=!1,this.value=e.target?.value,t.value&&!this.instructionHidden&&this.focusInput(),o.setLoading(!0),this.onDebouncedSearch(t.value)}setReceiverAddress(e){o.setReceiverAddress(e),o.setReceiverProfileName(void 0),o.setReceiverProfileImageUrl(void 0),o.setLoading(!1)}};k.styles=D,O([S()],k.prototype,`value`,void 0),O([S({type:Boolean})],k.prototype,`readOnly`,void 0),O([w()],k.prototype,`instructionHidden`,void 0),O([w()],k.prototype,`pasting`,void 0),k=O([b(`w3m-input-address`)],k);var A=_`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({borderRadius:e})=>e[5]};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
    transition: all ${({easings:e})=>e[`ease-out-power-1`]}
      ${({durations:e})=>e.lg};
  }

  :host(:hover) {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  wui-input-amount {
    mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
  }

  .totalValue {
    width: 100%;
  }
`,j=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},M=class extends m{constructor(){super(...arguments),this.readOnly=!1,this.isInsufficientBalance=!1}render(){let e=this.readOnly||!this.token;return h` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${[`5`,`3`,`4`,`3`]}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${e}
          .value=${this.sendTokenAmount??``}
          ?error=${!!this.isInsufficientBalance}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      ${this.bottomTemplate()}
    </wui-flex>`}buttonTemplate(){return this.token?h`<wui-token-button
        text=${this.token.symbol}
        imageSrc=${this.token.iconUrl}
        @click=${this.handleSelectButtonClick.bind(this)}
      >
      </wui-token-button>`:h`<wui-button
      size="md"
      variant="neutral-secondary"
      @click=${this.handleSelectButtonClick.bind(this)}
      >Select token</wui-button
    >`}handleSelectButtonClick(){this.readOnly||n.push(`WalletSendSelectToken`)}sendValueTemplate(){if(!this.readOnly&&this.token&&this.sendTokenAmount){let e=this.token.price*Number(this.sendTokenAmount);return h`<wui-text class="totalValue" variant="sm-regular" color="secondary"
        >${e?`$${l.formatNumberToLocalString(e,2)}`:`Incorrect value`}</wui-text
      >`}return null}maxAmountTemplate(){return this.token?h` <wui-text variant="sm-regular" color="secondary">
        ${y.roundNumber(Number(this.token.quantity.numeric),6,5)}
      </wui-text>`:null}actionTemplate(){return this.token?h`<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`:null}bottomTemplate(){return this.readOnly?null:h`<wui-flex alignItems="center" justifyContent="space-between">
      ${this.sendValueTemplate()}
      <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
        ${this.maxAmountTemplate()} ${this.actionTemplate()}
      </wui-flex>
    </wui-flex>`}onInputChange(e){o.setTokenAmount(String(e.detail))}onMaxClick(){if(this.token){let e=Number(this.token.quantity.decimals),t=l.bigNumber(this.token.quantity.numeric);if(!this.token.address&&this.gasPrice){let n=65000n*BigInt(this.gasPrice),r=l.bigNumber(n.toString()).div(l.bigNumber(10).pow(e)),i=t.minus(r);o.setTokenAmount(i.gt(0)?i.toFixed(e,0):`0`)}else o.setTokenAmount(t.toFixed(e,0))}}};M.styles=A,j([S({type:Object})],M.prototype,`token`,void 0),j([S({type:Boolean})],M.prototype,`readOnly`,void 0),j([S({type:String})],M.prototype,`sendTokenAmount`,void 0),j([S({type:Boolean})],M.prototype,`isInsufficientBalance`,void 0),j([S({type:String})],M.prototype,`gasPrice`,void 0),M=j([b(`w3m-input-token`)],M);var N=_`
  :host {
    display: block;
  }

  wui-flex {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[10]} !important;
    border: 4px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  wui-button {
    --local-border-radius: ${({borderRadius:e})=>e[4]} !important;
  }

  .inputContainer {
    height: fit-content;
  }
`,P=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},F={INSUFFICIENT_FUNDS:`Insufficient Funds`,INCORRECT_VALUE:`Incorrect Value`,INVALID_ADDRESS:`Invalid Address`,ADD_ADDRESS:`Add Address`,ADD_AMOUNT:`Add Amount`,SELECT_TOKEN:`Select Token`,PREVIEW_SEND:`Preview Send`},I=class extends m{constructor(){super(),this.unsubscribe=[],this.isTryingToChooseDifferentWallet=!1,this.token=o.state.token,this.sendTokenAmount=o.state.sendTokenAmount,this.receiverAddress=o.state.receiverAddress,this.receiverProfileName=o.state.receiverProfileName,this.loading=o.state.loading,this.params=n.state.data?.send,this.caipAddress=c.getAccountData()?.caipAddress,this.disconnecting=!1,this.gasFee=x.state.gasFee,this.token&&!this.params&&(this.fetchBalances(),this.fetchNetworkPrice());let e=c.subscribeKey(`activeCaipAddress`,t=>{!t&&this.isTryingToChooseDifferentWallet&&(this.isTryingToChooseDifferentWallet=!1,u.open({view:`Connect`,data:{redirectView:`WalletSend`}}).catch(()=>null),e())});this.unsubscribe.push(c.subscribeAccountStateProp(`caipAddress`,e=>{this.caipAddress=e}),o.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.loading=e.loading}),x.subscribeKey(`gasFee`,e=>{this.gasFee=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){await this.handleSendParameters()}render(){let e=this.getMessage(),t=!!this.params;return h` <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
          .gasPrice=${this.gasFee}
          ?readOnly=${t}
          ?isInsufficientBalance=${e===F.INSUFFICIENT_FUNDS}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          ?readOnly=${t}
          .value=${this.receiverProfileName?this.receiverProfileName:this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      ${this.buttonTemplate(e)}
    </wui-flex>`}async fetchBalances(){await o.fetchTokenBalance(),o.fetchNetworkBalance()}async fetchNetworkPrice(){await x.getNetworkTokenPrice(),await x.getInitialGasPrice()}onButtonClick(){n.push(`WalletSendPreview`,{send:this.params})}onFundWalletClick(){n.push(`FundWallet`,{redirectView:`WalletSend`})}async onConnectDifferentWalletClick(){try{this.isTryingToChooseDifferentWallet=!0,this.disconnecting=!0,await r.disconnect()}finally{this.disconnecting=!1}}getMessage(){return this.token?this.sendTokenAmount?this.token.price&&!(Number(this.sendTokenAmount)*this.token.price)?F.INCORRECT_VALUE:l.bigNumber(this.sendTokenAmount).gt(this.token.quantity.numeric)?F.INSUFFICIENT_FUNDS:this.receiverAddress?e.isAddress(this.receiverAddress,c.state.activeChain)?F.PREVIEW_SEND:F.INVALID_ADDRESS:F.ADD_ADDRESS:F.ADD_AMOUNT:F.SELECT_TOKEN}buttonTemplate(e){let t=!e.startsWith(F.PREVIEW_SEND),n=e===F.INSUFFICIENT_FUNDS,r=!!this.params;return n&&!r?h`
        <wui-flex .margin=${[`4`,`0`,`0`,`0`]} flexDirection="column" gap="4">
          <wui-button
            @click=${this.onFundWalletClick.bind(this)}
            size="lg"
            variant="accent-secondary"
            fullWidth
          >
            Fund Wallet
          </wui-button>

          <wui-separator data-testid="wui-separator" text="or"></wui-separator>

          <wui-button
            @click=${this.onConnectDifferentWalletClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
            fullWidth
            ?loading=${this.disconnecting}
          >
            Connect a different wallet
          </wui-button>
        </wui-flex>
      `:h`<wui-flex .margin=${[`4`,`0`,`0`,`0`]}>
      <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${t}
        size="lg"
        variant="accent-primary"
        ?loading=${this.loading}
        fullWidth
      >
        ${e}
      </wui-button>
    </wui-flex>`}async handleSendParameters(){if(this.loading=!0,!this.params){this.loading=!1;return}let e=Number(this.params.amount);if(isNaN(e)){a.showError(`Invalid amount`),this.loading=!1;return}let{namespace:t,chainId:n,assetAddress:r}=this.params;if(!d.SEND_PARAMS_SUPPORTED_CHAINS.includes(t)){a.showError(`Chain "${t}" is not supported for send parameters`),this.loading=!1;return}let i=c.getCaipNetworkById(n,t);if(!i){a.showError(`Network with id "${n}" not found`),this.loading=!1;return}try{let{balance:t,name:n,symbol:s,decimals:c}=await f.fetchERC20Balance({caipAddress:this.caipAddress,assetAddress:r,caipNetwork:i});if(!n||!s||!c||!t){a.showError(`Token not found`);return}o.setToken({name:n,symbol:s,chainId:i.id.toString(),address:`${i.chainNamespace}:${i.id}:${r}`,value:0,price:0,quantity:{decimals:c.toString(),numeric:t.toString()},iconUrl:p.getTokenImage(s)??``}),o.setTokenAmount(String(e)),o.setReceiverAddress(this.params.to)}catch(e){console.error(`Failed to load token information:`,e),a.showError(`Failed to load token information`)}finally{this.loading=!1}}};I.styles=N,P([w()],I.prototype,`token`,void 0),P([w()],I.prototype,`sendTokenAmount`,void 0),P([w()],I.prototype,`receiverAddress`,void 0),P([w()],I.prototype,`receiverProfileName`,void 0),P([w()],I.prototype,`loading`,void 0),P([w()],I.prototype,`params`,void 0),P([w()],I.prototype,`caipAddress`,void 0),P([w()],I.prototype,`disconnecting`,void 0),P([w()],I.prototype,`gasFee`,void 0),I=P([b(`w3m-wallet-send-view`)],I);var ee=_`
  .contentContainer {
    height: 440px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }

  wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e[3]};
  }
`,L=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},R=class extends m{constructor(){super(),this.unsubscribe=[],this.tokenBalances=o.state.tokenBalances,this.search=``,this.onDebouncedSearch=e.debounce(e=>{this.search=e}),this.fetchBalancesAndNetworkPrice(),this.unsubscribe.push(o.subscribe(e=>{this.tokenBalances=e.tokenBalances}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return h`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `}async fetchBalancesAndNetworkPrice(){(!this.tokenBalances||this.tokenBalances?.length===0)&&(await this.fetchBalances(),await this.fetchNetworkPrice())}async fetchBalances(){await o.fetchTokenBalance(),o.fetchNetworkBalance()}async fetchNetworkPrice(){await x.getNetworkTokenPrice()}templateSearchInput(){return h`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}templateTokens(){return this.tokens=this.tokenBalances?.filter(e=>e.chainId===c.state.activeCaipNetwork?.caipNetworkId),this.search?this.filteredTokens=this.tokenBalances?.filter(e=>e.name.toLowerCase().includes(this.search.toLowerCase())):this.filteredTokens=this.tokens,h`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${[`0`,`3`,`0`,`3`]}
      >
        <wui-flex justifyContent="flex-start" .padding=${[`4`,`3`,`3`,`3`]}>
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${this.filteredTokens&&this.filteredTokens.length>0?this.filteredTokens.map(e=>h`<wui-list-token
                    @click=${this.handleTokenClick.bind(this,e)}
                    ?clickable=${!0}
                    tokenName=${e.name}
                    tokenImageUrl=${e.iconUrl}
                    tokenAmount=${e.quantity.numeric}
                    tokenValue=${e.value}
                    tokenCurrency=${e.symbol}
                  ></wui-list-token>`):h`<wui-flex
                .padding=${[`20`,`0`,`0`,`0`]}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                  <wui-text variant="lg-regular" align="center" color="secondary">
                    Your tokens will appear here
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `}onBuyClick(){n.push(`OnRampProviders`)}onInputChange(e){this.onDebouncedSearch(e.detail)}handleTokenClick(e){o.setToken(e),o.setTokenAmount(void 0),n.goBack()}};R.styles=ee,L([w()],R.prototype,`tokenBalances`,void 0),L([w()],R.prototype,`tokens`,void 0),L([w()],R.prototype,`filteredTokens`,void 0),L([w()],R.prototype,`search`,void 0),R=L([b(`w3m-wallet-send-select-token-view`)],R);var z=_`
  :host {
    height: 32px;
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    border-radius: ${({borderRadius:e})=>e[32]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    padding: ${({spacing:e})=>e[1]};
    padding-left: ${({spacing:e})=>e[2]};
  }

  wui-avatar,
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }
`,B=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},V=class extends m{constructor(){super(...arguments),this.text=``}render(){return h`<wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      ${this.imageTemplate()}`}imageTemplate(){return this.address?h`<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`:this.imageSrc?h`<wui-image src=${this.imageSrc}></wui-image>`:h`<wui-icon size="lg" color="inverse" name="networkPlaceholder"></wui-icon>`}};V.styles=[v,g,z],B([S({type:String})],V.prototype,`text`,void 0),B([S({type:String})],V.prototype,`address`,void 0),B([S({type:String})],V.prototype,`imageSrc`,void 0),V=B([b(`wui-preview-item`)],V);var H=_`
  :host {
    display: flex;
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-image {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }
`,U=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},W=class extends m{constructor(){super(...arguments),this.imageSrc=void 0,this.textTitle=``,this.textValue=void 0}render(){return h`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="primary"> ${this.textTitle} </wui-text>
        ${this.templateContent()}
      </wui-flex>
    `}templateContent(){return this.imageSrc?h`<wui-image src=${this.imageSrc} alt=${this.textTitle}></wui-image>`:this.textValue?h` <wui-text variant="md-regular" color="secondary"> ${this.textValue} </wui-text>`:h`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};W.styles=[v,g,H],U([S()],W.prototype,`imageSrc`,void 0),U([S()],W.prototype,`textTitle`,void 0),U([S()],W.prototype,`textValue`,void 0),W=U([b(`wui-list-content`)],W);var G=_`
  :host {
    display: flex;
    width: auto;
    flex-direction: column;
    gap: ${({spacing:e})=>e[1]};
    border-radius: ${({borderRadius:e})=>e[5]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[2]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
  }

  wui-list-content {
    width: -webkit-fill-available !important;
  }

  wui-text {
    padding: 0 ${({spacing:e})=>e[2]};
  }

  wui-flex {
    margin-top: ${({spacing:e})=>e[2]};
  }

  .network {
    cursor: pointer;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e[`ease-out-power-1`]};
    will-change: background-color;
  }

  .network:focus-visible {
    border: 1px solid ${({tokens:e})=>e.core.textAccentPrimary};
    background-color: ${({tokens:e})=>e.core.glass010};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent010};
  }

  .network:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .network:active {
    background-color: ${({tokens:e})=>e.core.glass010};
  }
`,K=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},q=class extends m{constructor(){super(...arguments),this.params=n.state.data?.send}render(){return h` <wui-text variant="sm-regular" color="secondary">Details</wui-text>
      <wui-flex flexDirection="column" gap="1">
        <wui-list-content
          textTitle="Address"
          textValue=${y.getTruncateString({string:this.receiverAddress??``,charsStart:4,charsEnd:4,truncate:`middle`})}
        >
        </wui-list-content>
        ${this.networkTemplate()}
      </wui-flex>`}networkTemplate(){return this.caipNetwork?.name?h` <wui-list-content
        @click=${()=>this.onNetworkClick(this.caipNetwork)}
        class="network"
        textTitle="Network"
        imageSrc=${C(p.getNetworkImage(this.caipNetwork))}
      ></wui-list-content>`:null}onNetworkClick(e){e&&!this.params&&n.push(`Networks`,{network:e})}};q.styles=G,K([S()],q.prototype,`receiverAddress`,void 0),K([S({type:Object})],q.prototype,`caipNetwork`,void 0),K([w()],q.prototype,`params`,void 0),q=K([b(`w3m-wallet-send-details`)],q);var J=_`
  wui-avatar,
  wui-image {
    display: ruby;
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[20]};
  }

  .sendButton {
    width: 70%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:e})=>e[4]} !important;
  }

  .cancelButton {
    width: 30%;
    --local-width: 100% !important;
    --local-border-radius: ${({borderRadius:e})=>e[4]} !important;
  }
`,Y=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},X=class extends m{constructor(){super(),this.unsubscribe=[],this.token=o.state.token,this.sendTokenAmount=o.state.sendTokenAmount,this.receiverAddress=o.state.receiverAddress,this.receiverProfileName=o.state.receiverProfileName,this.receiverProfileImageUrl=o.state.receiverProfileImageUrl,this.caipNetwork=c.state.activeCaipNetwork,this.loading=o.state.loading,this.params=n.state.data?.send,this.unsubscribe.push(o.subscribe(e=>{this.token=e.token,this.sendTokenAmount=e.sendTokenAmount,this.receiverAddress=e.receiverAddress,this.receiverProfileName=e.receiverProfileName,this.receiverProfileImageUrl=e.receiverProfileImageUrl,this.loading=e.loading}),c.subscribeKey(`activeCaipNetwork`,e=>this.caipNetwork=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return h` <wui-flex flexDirection="column" .padding=${[`0`,`4`,`4`,`4`]}>
      <wui-flex gap="2" flexDirection="column" .padding=${[`0`,`2`,`0`,`2`]}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.sendTokenAmount?y.roundNumber(Number(this.sendTokenAmount),6,5):`unknown`} ${this.token?.symbol}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="default" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="sm-regular" color="secondary">To</wui-text>
          <wui-preview-item
            text="${this.receiverProfileName?y.getTruncateString({string:this.receiverProfileName,charsStart:20,charsEnd:0,truncate:`end`}):y.getTruncateString({string:this.receiverAddress?this.receiverAddress:``,charsStart:4,charsEnd:4,truncate:`middle`})}"
            address=${this.receiverAddress??``}
            .imageSrc=${this.receiverProfileImageUrl??void 0}
            .isAddress=${!0}
          ></wui-preview-item>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" .padding=${[`6`,`0`,`0`,`0`]}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="1" .padding=${[`3`,`0`,`0`,`0`]}>
          <wui-icon size="sm" color="default" name="warningCircle"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="3" .padding=${[`4`,`0`,`0`,`0`]}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="accent-primary"
            .loading=${this.loading}
          >
            Send
          </wui-button>
        </wui-flex>
      </wui-flex></wui-flex
    >`}sendValueTemplate(){return!this.params&&this.token&&this.sendTokenAmount?h`<wui-text variant="md-regular" color="primary"
        >$${(this.token.price*Number(this.sendTokenAmount)).toFixed(2)}</wui-text
      >`:null}async onSendClick(){if(!this.sendTokenAmount||!this.receiverAddress){a.showError(`Please enter a valid amount and receiver address`);return}try{await o.sendToken(),this.params?n.reset(`WalletSendConfirmed`):(a.showSuccess(`Transaction started`),n.replace(`Account`))}catch(e){let n=`Failed to send transaction`,r=e instanceof i&&e.originalName===s.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST,c=e instanceof i&&e.originalName===s.PROVIDER_RPC_ERROR_NAME.SEND_TRANSACTION_ERROR;(r||c)&&(n=e.message),t.sendEvent({type:`track`,event:r?`SEND_REJECTED`:`SEND_ERROR`,properties:o.getSdkEventProperties(e)}),a.showError(n)}}onCancelClick(){n.goBack()}};X.styles=J,Y([w()],X.prototype,`token`,void 0),Y([w()],X.prototype,`sendTokenAmount`,void 0),Y([w()],X.prototype,`receiverAddress`,void 0),Y([w()],X.prototype,`receiverProfileName`,void 0),Y([w()],X.prototype,`receiverProfileImageUrl`,void 0),Y([w()],X.prototype,`caipNetwork`,void 0),Y([w()],X.prototype,`loading`,void 0),Y([w()],X.prototype,`params`,void 0),X=Y([b(`w3m-wallet-send-preview-view`)],X);var Z=_`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: ${({spacing:e})=>e[16]};
    border: 8px solid ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e.round};
  }
`,Q=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},$=class extends m{constructor(){super(),this.unsubscribe=[],this.unsubscribe.push()}render(){return h`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${[`1`,`3`,`4`,`3`]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="success" name="checkmark"></wui-icon>
        </wui-flex>

        <wui-text variant="h6-medium" color="primary">You successfully sent asset</wui-text>

        <wui-button
          fullWidth
          @click=${this.onCloseClick.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `}onCloseClick(){u.close()}};$.styles=Z,$=Q([b(`w3m-send-confirmed-view`)],$);export{$ as W3mSendConfirmedView,R as W3mSendSelectTokenView,X as W3mWalletSendPreviewView,I as W3mWalletSendView};