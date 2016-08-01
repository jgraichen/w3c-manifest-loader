import {interpolateName} from 'loader-utils';
import {join} from 'path';
import u from 'untab';

export default async function process(manifest, context, config){
  const content = JSON.stringify(manifest, null, '  ');
  const url = interpolateName(context, config.name, {
      context: config.context || context.options.context,
      content: content,
      regExp: config.regExp
    });

  const publicPath = "__webpack_public_path__ + " + JSON.stringify(url);
  context.emitFile(url, content);

  return u`
    var link = document.createElement('link');
    link.setAttribute('rel', 'manifest');
    link.setAttribute('href', ${publicPath});
    document.head.appendChild(link);
    ${config.legacyAppleSupport ? legacyAppleManifest(manifest) : ''}`;
}

function legacyAppleManifest(manifest){
  return u`
    var manifest = ${JSON.stringify(manifest)};
    if(manifest.icons && manifest.icons.length){
      for(var i in manifest.icons){
        var link = document.createElement('link');
        link.setAttribute('rel', 'apple-touch-icon');
        link.setAttribute('sizes', manifest.icons[i].sizes);
        link.setAttribute('href', manifest.icons[i].src);
        document.head.appendChild(link);
      }
    }
    if(manifest.display && (manifest.display == 'fullscreen' || manifest.display == 'standalone')){
      var meta = document.createElement('meta');
      meta.setAttribute('rel', 'apple-mobile-web-app-capable');
      meta.setAttribute('content', 'yes');
      document.head.appendChild(meta);
    }
    if(manifest.theme_color){
      var meta = document.createElement('meta');
      meta.setAttribute('rel', 'apple-mobile-web-app-status-bar-style');
      meta.setAttribute('content', manifest.theme_color);
      document.head.appendChild(meta);
    }
  `;
}
