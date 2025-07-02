export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow more than one <main> element per file',
      recommended: true,
    },
    schema: [], // no options
    messages: {
      multipleMains: 'Only one <main> element is allowed per file.',
    },
  },
  create(context) {
    let mainCount = 0;
    return {
      JSXOpeningElement(node) {
        if (
          node.name &&
          ((node.name.type === 'JSXIdentifier' && node.name.name === 'main') ||
            // For <main> with namespace: <html:main>
            (node.name.type === 'JSXNamespacedName' && node.name.name.name === 'main'))
        ) {
          mainCount += 1;
          if (mainCount > 1) {
            context.report({
              node,
              messageId: 'multipleMains',
            });
          }
        }
      },
      'Program:exit'() {
        mainCount = 0; // reset for next file
      },
    };
  },
};
