import React from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import { last } from "lodash";

// Fetch full source for an article
// http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=Jimi_Hendrix&callback=?

let wikipedia_namespaces = [
  "User",
  "Wikipedia",
  "Talk",
  "File",
  "MediaWiki",
  "Template",
  "Help",
  "Category",
  "Portal",
  "Draft",
  "TimedText",
  "Module",
  "Special",
  "Media"
];

const appendStylesToHead = style => {
  // Escape any single quotes or newlines in the CSS with .replace()
  const escaped = style.replace(/\'/g, "\\'").replace(/\n/g, "\\n");
  return `
    var styleElement = document.createElement('style');
    styleElement.innerHTML = '${escaped}';
    document.head.appendChild(styleElement);
  `;
};

export let get_wiki_subject = url => {
  let match = url.match(/https?:\/\/en\.(?:m\.)?wikipedia\.org\/wiki\/([^#]*)/);
  if (match == null) {
    return null;
  } else {
    let subject = decodeURIComponent(match[1].replace(/_/g, " "));

    if (wikipedia_namespaces.some(namespace => subject.startsWith(`${namespace}:`))) {
      return null;
    } else {
      return subject;
    }
  }
};

export let WikipediaView = ({ history, onHistoryChange }) => {
  let webview_ref = React.useRef();

  let style_adder = appendStylesToHead(`
    .header-container.header-chrome,
    .sistersitebox,
    #page-actions,
    .navigation-not-searchable,
    #mw-data-after-content,
    #disambigbox,
    .noprint,
    .last-modified-bar,
    .reference,
    .mw-editsection {
      display: none !important;
    }

    .footer > .post-content {
      margin-top: 0 !important;
    }
    .minerva-footer {
      pointer-events: none;
    }
    body {
      overflow-x: hidden !important;
    }
    p a {
      display: inline-block;
      margin-bottom: -.5em;

      padding-left: 8px;
      padding-right: 8px;
      font-weight: bold;
      white-space: nowrap;

      max-width: 90vw;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webview_ref}
        style={{ flex: 1 }}
        onLoad={() => {
          webview_ref.current.injectJavaScript(style_adder);
          webview_ref.current.injectJavaScript(`
            for (let title of ['References', 'Further_reading', 'External_links', 'Bibliography', 'Notes']) {
              try {
                let innerelement = document.querySelector('.mw-headline#'+title);
                let title_element = innerelement.closest('h2');

                let content_element = title_element.nextSibling;
                title_element.remove();
                content_element.remove();
              } catch (error) {}
            }
          `);
          // webview_ref.current.injectJavaScript(`
          //   for (let anchor of document.querySelectorAll('a')) {
          //     if (a.href) {
          //
          //     }
          //     try {
          //       let innerelement = document.querySelector('.mw-headline#'+title);
          //       let title_element = innerelement.closest('h2');
          //
          //       let content_element = title_element.nextSibling;
          //       title_element.remove();
          //       content_element.remove();
          //     } catch (error) {}
          //   }
          // `);
        }}
        onError={error => {
          console.log(`error:`, error);
        }}
        onShouldStartLoadWithRequest={request => {
          let subject = get_wiki_subject(request.url);
          return subject != null;
        }}
        source={{ uri: last(history) }}
        onNavigationStateChange={navstate => {
          let subject = get_wiki_subject(navstate.url);
          let subject_changed =
            last(history) == null ||
            subject !== get_wiki_subject(last(history));
          if (last(history) !== navstate.url && subject_changed) {
            onHistoryChange([...history, navstate.url]);
          }
        }}
      />
    </View>
  );
};
