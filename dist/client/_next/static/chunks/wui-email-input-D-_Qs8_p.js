import{f as e,g as t,o as n,t as r,x as i}from"./exports-OzXcm-9f.js";import{c as a,o}from"./wui-text-JiSAUhpb.js";import"./wui-input-text-Gnafwmyl.js";var s=i`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`,c=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},l=class extends e{constructor(){super(...arguments),this.disabled=!1}render(){return t`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="mail"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${o(this.tabIdx)}
      ></wui-input-text>
      ${this.templateError()}
    `}templateError(){return this.errorMessage?t`<wui-text variant="sm-regular" color="error">${this.errorMessage}</wui-text>`:null}};l.styles=[n,s],c([a()],l.prototype,`errorMessage`,void 0),c([a({type:Boolean})],l.prototype,`disabled`,void 0),c([a()],l.prototype,`value`,void 0),c([a()],l.prototype,`tabIdx`,void 0),l=c([r(`wui-email-input`)],l);