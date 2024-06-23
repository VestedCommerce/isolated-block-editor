/**
 * WordPress dependencies
 */

import { createRoot, unmountComponentAtNode } from '@wordpress/element';

/**
 * Internal dependencies
 */

import './style.scss';
import { Button, DropdownMenu } from '@wordpress/components';
import { desktop, fullscreen } from '@wordpress/icons';
import IsolatedBlockEditor, { EditorLoaded, DocumentSection, ToolbarSlot } from '../index';
import {parse} from '@wordpress/block-serialization-spec-parser';
import { dispatch } from '@wordpress/data';

/** @typedef {import('../index').BlockEditorSettings} BlockEditorSettings */

/**
 * These are the Gutenberg and IsolatedBlockEditor settings. Everything not set uses the defaults.
 *
 * @type BlockEditorSettings
 */
const settings = {
	iso: {
		moreMenu: {
			editor: true,
			fullscreen: true,
		},
		toolbar: {
			undo: true,
			inserter: true,
			inspector: true,
			navigation: true,
			selectorTool: true,
		},
		sidebar:{
			inspector: true,
			inserter: true,
		},
		footer:true,
		header:true,
		blocks:{
			allowBlocks:[],
			disallowBlocks: [
				'core/embed',
				'core/freeform',
				'core/shortcode',
				'core/tag-cloud',
				'core/block',
				'core/rss',
				'core/search',
				'core/calendar',
				'core/categories',
				'core/more',
				'core/nextpage',

				'core/term-description',

				'core/site-logo',
				'core/site-tagline',
				'core/site-title',

				'core/archives',
				'core/loginout',

				'core/comment-template',
				'core/comments',
				'core/latest-comments',

				'core/post-author',
				'core/latest-posts',
				'core/post-author-biography',
				'core/post-author-name',
				'core/post-comment',
				'core/post-comments-count',
				'core/post-comments-form',
				'core/post-comments-link',
				'core/post-content',
				'core/post-date',
				'core/post-excerpt',
				'core/post-featured-image',
				'core/post-navigation-link',
				'core/post-template',
				'core/post-terms',
				'core/post-time-to-read',
				'core/post-title'
			]
		}
	},
};

/**
 * Saves content to the textarea
 *
 * @param {string} content Serialized block content
 * @param {HTMLTextAreaElement} textarea Textarea node
 */
function saveBlocks( content, textarea ) {
	let jsonTextrea = document.getElementById('json')
	// @ts-ignore
	jsonTextrea.value = JSON.stringify(parse(content))
	textarea.value = content;
}

/**
 * Initial content loader. Determine if the textarea contains blocks or raw HTML
 *
 * @param {string} content Text area content
 * @param {*} parser Gutenberg `parse` function
 * @param {*} rawHandler Gutenberg `rawHandler` function
 */
function onLoad( content, parser, rawHandler ) {
	// Does the content contain blocks?
	if ( content.indexOf( '<!--' ) !== -1 ) {
		// Parse the blocks
		return parser( content );
	}

	// Raw HTML - do our best
	return rawHandler( { HTML: content } );
}

/**
 * Attach IsolatedBlockEditor to a textarea
 *
 * @param {HTMLTextAreaElement} textarea Textarea node
 * @param {BlockEditorSettings} userSettings Settings object
 */
function attachEditor( textarea, userSettings = {} ) {
	// Check it's a textarea
	if ( textarea.type.toLowerCase() !== 'textarea' ) {
		return;
	}

	// Create a node after the textarea
	const editor = document.createElement( 'div' );
	editor.classList.add( 'editor' );

	const editorReactRoot = createRoot( editor );

	// Insert after the textarea, and hide it
	// @ts-ignore
	textarea.parentNode.insertBefore( editor, textarea.nextSibling );
	textarea.style.display = 'none';

	// Render the editor
	editorReactRoot.render(
		<IsolatedBlockEditor
			settings={ { ...settings, ...userSettings } }
			onLoad={ ( parser, rawHandler ) => onLoad( textarea.value, parser, rawHandler ) }
			onSaveContent={ ( content ) => saveBlocks( content, textarea ) }
			onError={ () => document.location.reload() }
		>
			<EditorLoaded
				onLoaded={() => { console.log('🚀 ~ LOADED') }}
				onLoading={() => { console.log('🚀 ~ LOADING') }}
			/>
			<DocumentSection>Extra Information</DocumentSection>
			<ToolbarSlot>
				<DropdownMenu
					controls={[
						{
							onClick: function noRefCheck(){},
							title: 'First Menu Item Label'
						},
						{
							onClick: function noRefCheck(){},
							title: 'Second Menu Item Label'
						}
					]}
					icon={desktop}
					label="Select a direction."
					onToggle={function noRefCheck(){}}
				/>
				<Button onClick={fullscreenMode} icon={fullscreen}/>
			</ToolbarSlot>
		</IsolatedBlockEditor>
	);
}

function fullscreenMode(){
	// @ts-ignore
	dispatch( 'core/edit-post').toggleFeature( 'fullscreenMode' )
}
/**
 * Remove IsolatedBlockEditor from a textarea node
 *
 * @param {HTMLTextAreaElement} textarea Textarea node
 */
function detachEditor( textarea ) {
	/**
	 * @type {HTMLElement}
	 */
	// @ts-ignore
	const editor = textarea.nextSibling;

	if ( editor && editor.classList.contains( 'editor' ) ) {
		unmountComponentAtNode( editor );

		// @ts-ignore
		textarea.style.display = null;
		// @ts-ignore
		editor.parentNode.removeChild( editor );
	}
}

// This adds the functions to the WP global, making it easier for the example to work.
window.wp = {
	...( window.wp ?? {} ),
	attachEditor,
	detachEditor,
};
