/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    AutoEmbedOption,
    EmbedConfig,
    EmbedMatchResult,
    LexicalAutoEmbedPlugin,
    URL_MATCHER,
  } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMemo, useState } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';

import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import { DialogActions } from '../../ui/Dialog';
import { INSERT_TWEET_COMMAND } from '../TwitterPlugin';
import { INSERT_YOUTUBE_COMMAND } from '../YouTubePlugin';
import { INSERT_VIMEO_COMMAND } from '../VimeoPlugin';

function extractUrlFromInput(rawInput = '') {
    const input = String(rawInput || '').trim();
    if (!input) {
        return '';
    }

    const iframeSourceMatch = input.match(/src\s*=\s*['"]([^'"]+)['"]/i);
    if (iframeSourceMatch && iframeSourceMatch[1]) {
        return iframeSourceMatch[1].trim();
    }

    return input;
}

function parseYouTubeVideoId(rawInput = '') {
    const preparedInput = extractUrlFromInput(rawInput);
    const directId = preparedInput.match(/^[a-zA-Z0-9_-]{11}$/);
    if (directId) {
        return directId[0];
    }

    let candidateId = '';
    try {
        const normalizedInput = /^https?:\/\//i.test(preparedInput)
            ? preparedInput
            : `https://${preparedInput}`;
        const url = new URL(normalizedInput);
        const host = url.hostname.replace(/^www\./i, '').toLowerCase();
        const segments = url.pathname.split('/').filter(Boolean);

        if (host === 'youtu.be') {
            candidateId = segments[0] || '';
        } else if (
            host === 'youtube.com' ||
            host === 'm.youtube.com' ||
            host.endsWith('.youtube.com') ||
            host === 'youtube-nocookie.com' ||
            host.endsWith('.youtube-nocookie.com')
        ) {
            candidateId = url.searchParams.get('v') || '';

            if (!candidateId && segments.length > 0) {
                if (segments[0] === 'shorts' || segments[0] === 'embed' || segments[0] === 'live' || segments[0] === 'v') {
                    candidateId = segments[1] || '';
                } else if (segments.length === 1) {
                    candidateId = segments[0];
                }
            }
        }
    } catch {
        // Invalid URL format, fallback regex below.
    }

    if (!candidateId) {
        const fallbackMatch = preparedInput.match(
            /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        candidateId = fallbackMatch ? fallbackMatch[1] : '';
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(candidateId) ? candidateId : null;
}

function parseVimeoVideoId(rawInput = '') {
    const preparedInput = extractUrlFromInput(rawInput);
    const directId = preparedInput.match(/^\d{6,}$/);
    if (directId) {
        return directId[0];
    }

    let candidateId = '';
    try {
        const normalizedInput = /^https?:\/\//i.test(preparedInput)
            ? preparedInput
            : `https://${preparedInput}`;
        const url = new URL(normalizedInput);
        const host = url.hostname.replace(/^www\./i, '').toLowerCase();
        const segments = url.pathname.split('/').filter(Boolean);

        if (host === 'player.vimeo.com' || host.endsWith('.player.vimeo.com')) {
            const videoIndex = segments.indexOf('video');
            if (videoIndex !== -1) {
                candidateId = segments[videoIndex + 1] || '';
            }
        } else if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
            for (let index = segments.length - 1; index >= 0; index -= 1) {
                if (/^\d+$/.test(segments[index])) {
                    candidateId = segments[index];
                    break;
                }
            }
        }
    } catch {
        // Invalid URL format, fallback regex below.
    }

    if (!candidateId) {
        const fallbackMatch = preparedInput.match(
            /(?:vimeo\.com\/(?:video\/)?)(\d{6,})/
        );
        candidateId = fallbackMatch ? fallbackMatch[1] : '';
    }

    return /^\d{6,}$/.test(candidateId) ? candidateId : null;
}

export const YoutubeEmbedConfig = {
    contentName: 'Youtube Video',
    exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    icon: <i className="icon youtube" />,
    insertNode: (editor, result) => {
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
    },
    keywords: ['youtube', 'video'],
    parseUrl: async (url) => {
        const id = parseYouTubeVideoId(url);
        if (id != null) {
            return {
                id,
                url,
            };
        }
        return null;
    },
    type: 'youtube-video',
};

export const VimeoEmbedConfig = {
    contentName: 'Vimeo Video',
    exampleUrl: 'https://vimeo.com/76979871',
    icon: <i className="icon youtube" />,
    insertNode: (editor, result) => {
        editor.dispatchCommand(INSERT_VIMEO_COMMAND, result.id);
    },
    keywords: ['vimeo', 'video'],
    parseUrl: async (url) => {
        const id = parseVimeoVideoId(url);
        if (id != null) {
            return {
                id,
                url,
            };
        }
        return null;
    },
    type: 'vimeo-video',
};

export const TwitterEmbedConfig = {
    contentName: 'Tweet',
    exampleUrl: 'https://twitter.com/jack/status/20',
    icon: <i className="icon tweet" />,
    insertNode: (editor, result) => {
        editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id);
    },
    keywords: ['tweet', 'twitter'],
    parseUrl: (text) => {
        const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(text);
        if (match != null) {
            return {
                id: match[5],
                url: match[1],
            };
        }
        return null;
    },
    type: 'tweet',
};

export const EmbedConfigs = [
    TwitterEmbedConfig,
    YoutubeEmbedConfig,
    VimeoEmbedConfig,
];

function AutoEmbedMenuItem(props) {
    let className = 'item';
    if (props.isSelected) {
        className += ' selected';
    }
    return (
        <li
            key={props.option.key}
            tabIndex={-1}
            className={className}
            ref={props.option.setRefElement}
            role="option"
            aria-selected={props.isSelected}
            id={'typeahead-item-' + props.index}
            onMouseEnter={props.onMouseEnter}
            onClick={props.onClick}>
            <span className="text">{props.option.title}</span>
        </li>
    );
}

function AutoEmbedMenu(props) {
    return (
        <div className="typeahead-popover">
            <ul>
                {props.options.map((option, i) => (
                    <AutoEmbedMenuItem
                        index={i}
                        isSelected={props.selectedItemIndex === i}
                        onClick={() => props.onOptionClick(option, i)}
                        onMouseEnter={() => props.onOptionMouseEnter(i)}
                        key={option.key}
                        option={option}
                    />
                ))}
            </ul>
        </div>
    );
}

const debounce = (callback, delay) => {
    let timeoutId;
    return (text) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(text);
        }, delay);
    };
};

export function AutoEmbedDialog(props) {
    const [text, setText] = useState('');
    const [editor] = useLexicalComposerContext();
    const [embedResult, setEmbedResult] = useState(null);

    const validateText = useMemo(
        () =>
            debounce((inputText) => {
                const normalizedInput = extractUrlFromInput(inputText);
                const urlMatch = URL_MATCHER.exec(normalizedInput);
                const hasIframeSource = normalizedInput !== inputText;
                if (props.embedConfig && normalizedInput && (urlMatch || hasIframeSource)) {
                    Promise.resolve(props.embedConfig.parseUrl(normalizedInput)).then(
                        (parseResult) => {
                            setEmbedResult(parseResult);
                        }
                    );
                } else if (embedResult) {
                    setEmbedResult(null);
                }
            }, 200),
        [props.embedConfig, embedResult]
    );

    const onClick = () => {
        if (embedResult) {
            props.embedConfig.insertNode(editor, embedResult);
            props.onClose();
        }
    };

    return (
        <div style={{ width: '600px' }}>
            <div className="Input__wrapper">
                <input
                    type="text"
                    className="Input__input"
                    placeholder={props.embedConfig.exampleUrl}
                    value={text}
                    data-test-id={`${props.embedConfig.type}-embed-modal-url`}
                    onChange={(e) => {
                        const { value } = e.target;
                        setText(value);
                        validateText(value);
                    }}
                />
            </div>
            <DialogActions>
                <Button
                    disabled={!embedResult}
                    onClick={onClick}
                    data-test-id={`${props.embedConfig.type}-embed-modal-submit-btn`}
                >
                    Embed
                </Button>
            </DialogActions>
        </div>
    );
}

export default function AutoEmbedPlugin() {
    const [modal, showModal] = useModal();

    const openEmbedModal = (embedConfig) => {
        showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
            <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
        ));
    };

    const getMenuOptions = (activeEmbedConfig, embedFn, dismissFn) => {
        return [
            new AutoEmbedOption('Dismiss', {
                onSelect: dismissFn,
            }),
            new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
                onSelect: embedFn,
            }),
        ];
    };

    return (
        <>
            {modal}
            <LexicalAutoEmbedPlugin
                embedConfigs={EmbedConfigs}
                onOpenEmbedModalForConfig={openEmbedModal}
                getMenuOptions={getMenuOptions}
                menuRenderFn={(
                    anchorElementRef,
                    { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }
                ) =>
                    anchorElementRef.current
                        ? ReactDOM.createPortal(
                            <div
                                className="typeahead-popover auto-embed-menu"
                                style={{
                                    marginLeft: anchorElementRef.current.style.width,
                                    width: 200,
                                }}>
                                <AutoEmbedMenu
                                    options={options}
                                    selectedItemIndex={selectedIndex}
                                    onOptionClick={(option, index) => {
                                        setHighlightedIndex(index);
                                        selectOptionAndCleanUp(option);
                                    }}
                                    onOptionMouseEnter={(index) => {
                                        setHighlightedIndex(index);
                                    }}
                                />
                            </div>,
                            anchorElementRef.current
                        )
                        : null
                }
            />
        </>
    );
}
