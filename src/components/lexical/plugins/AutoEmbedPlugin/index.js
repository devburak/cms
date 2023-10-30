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

export const YoutubeEmbedConfig = {
    contentName: 'Youtube Video',
    exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    icon: <i className="icon youtube" />,
    insertNode: (editor, result) => {
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
    },
    keywords: ['youtube', 'video'],
    parseUrl: async (url) => {
        const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);
        const id = match ? (match[2].length === 11 ? match[2] : null) : null;
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
                const urlMatch = URL_MATCHER.exec(inputText);
                if (props.embedConfig && inputText && urlMatch) {
                    Promise.resolve(props.embedConfig.parseUrl(inputText)).then(
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

