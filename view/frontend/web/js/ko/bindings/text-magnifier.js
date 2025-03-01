define([
    'ko',
    'mage/translate'
], function(
    ko,
    $t
) {
    'use strict';

    ko.virtualElements.allowedBindings.textMagnifier = true;

    /**
     * Custom binding to magnify certain words in a text
     */
    ko.bindingHandlers.textMagnifier = {
        update: function(element, valueAccessor) {
            try {
                const options = valueAccessor() || {};
                const { text, words } = options;
                const translatedText = $t(text);
                const translatedWords = (words || []).map(word => $t(word));

                ko.bindingHandlers.textMagnifier.applyMagnifier(
                    element,
                    translatedText,
                    translatedWords
                );
            } catch (e) {
                console.error('Error in textMagnifier binding update:', e);
            }
        },

        applyMagnifier: function(element, text, wordsToMagnify) {
            try {
                let resultHtml = text;

                if (wordsToMagnify.length) {
                    const wordMatchingPattern = wordsToMagnify.map(word => '\\b(' + this.escapeRegExp(word) + ')\\b').join('|');
                    const wordMatches = new RegExp(wordMatchingPattern, 'gi');
                    resultHtml = text.replace(wordMatches, '<span class="text-magnifier">$&</span>');
                }

                this.renderContent(element, resultHtml);
            } catch (e) {
                console.error('Error in textMagnifier.applyMagnifier:', e);
            }
        },

        escapeRegExp: function(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        renderContent: function(element, html) {
            const isVirtual = element.nodeType === 8;
            let container;

            if (isVirtual) {
                container = document.createElement('span');
                container.innerHTML = html;
                ko.virtualElements.setDomNodeChildren(element, [container]);
            } else {
                element.innerHTML = html;
                container = element;
            }

            function handleEvent(event) {
                const target = event.target;

                if (target.classList?.contains('text-magnifier')) {
                    if (event.type === 'mouseenter') {
                        target.classList.add('magnified');
                    }

                    if (event.type === 'mouseleave') {
                        target.classList.remove('magnified');
                    }
                }
            }

            container.addEventListener('mouseenter', handleEvent, true);
            container.addEventListener('mouseleave', handleEvent, true);

            // Prevent memory leaks when associated DOM element is removed or KO removes binding
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                console.log('Disposed', element);
                container.removeEventListener('mouseenter', handleEvent, true);
                container.removeEventListener('mouseleave', handleEvent, true);
            });

            // Example code to test the disposal method
            // window.setTimeout(function() {
            //     ko.removeNode(element);
            // }, 2000);
        },
    };

    return ko.bindingHandlers.textMagnifier;
});
