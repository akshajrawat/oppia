// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Blog post editor utility file.
 */

import {expect, Page} from '@playwright/test';
import {BaseUser} from '../common/playwright-utils';
import testConstants from '../common/test-constants';

const blogDashboardUrl = testConstants.URLs.BlogDashboard;
const blogPostThumbnailImage = testConstants.data.blogPostThumbnailImage;
const dashboardReadySelector = '.blog-dashboard-card';
const authorDetailsModalSelector = '.e2e-test-blog-author-details-modal';
const authorNameInputSelector = '.e2e-test-blog-author-name-field';
const authorBioInputSelector = '.e2e-test-blog-author-bio-field';
const authorDetailsSaveButton = '.e2e-test-save-author-details-button';
const newBlogPostButton = '.e2e-test-create-blog-post-button';
const blogTitleInput = 'input.e2e-test-blog-post-title-field';
const blogBodyInput = 'div.e2e-test-rte';
const blogBodyEditorSelector = '.e2e-test-content-editor';
const blogBodyDisplaySelector = '.e2e-test-content-button';
const thumbnailPhotoBox = '.e2e-test-photo-clickable';
const thumbnailCropArea = '.e2e-test-photo-crop';
const addThumbnailImageButton = 'button.e2e-test-photo-upload-submit';
const thumbnailUploadSuccessMessage = 'Thumbnail Saved Successfully.';
const blogTagSelector = '.e2e-test-blog-post-tags';
const blogBodySaveButton = '.e2e-test-save-blog-post-content';
const saveDraftButton = 'button.e2e-test-save-as-draft-button';
const publishBlogPostButton = 'button.e2e-test-publish-blog-post-button';
const confirmButton = 'button.e2e-test-confirm-button';
const toastMessageSelector = '.e2e-test-toast-message';

export class BlogPostEditor extends BaseUser {
  /**
   * Opens the blog dashboard and completes author registration on first use.
   */
  async navigateToBlogDashboardPage(): Promise<void> {
    await this.goto(blogDashboardUrl);
    await this.expectElementToBeVisible(dashboardReadySelector);

    if (await this.isElementVisible(authorDetailsModalSelector, true, 1000)) {
      if (!this.username) {
        throw new Error('Username is not set for blog author registration.');
      }
      await this.page.locator(authorNameInputSelector).fill(this.username);
      await this.page
        .locator(authorBioInputSelector)
        .fill('A contributor to the Oppia Blog.');
      await this.page.locator(authorDetailsSaveButton).click();
      await this.expectElementToBeVisible(authorDetailsModalSelector, false);
      await this.expectElementToBeVisible(newBlogPostButton);
    }
  }

  /**
   * Opens a new blog post editor from the dashboard.
   */
  async openBlogEditorPage(): Promise<void> {
    await this.page.locator(newBlogPostButton).click();
    await this.expectElementToBeVisible('.e2e-test-blog-post-editor-container');
    await expect(this.page.locator(publishBlogPostButton)).toBeDisabled();
  }

  /**
   * Uploads the standard thumbnail and waits for the server save confirmation.
   */
  async uploadBlogPostThumbnailImage(): Promise<void> {
    if (!this.isViewportAtMobileWidth()) {
      await this.page.locator(thumbnailPhotoBox).click();
    }
    await this.uploadFile(blogPostThumbnailImage);
    await this.expectElementToBeVisible(thumbnailCropArea);
    await expect(this.page.locator(addThumbnailImageButton)).toBeEnabled();
    await this.page.locator(addThumbnailImageButton).click();
    const thumbnailSuccessToast = this.page
      .locator(toastMessageSelector)
      .filter({hasText: thumbnailUploadSuccessMessage});
    await expect(thumbnailSuccessToast).toBeVisible();
    if (this.isViewportAtMobileWidth()) {
      await thumbnailSuccessToast.click();
    }
    await expect(thumbnailSuccessToast).toBeHidden();

    if (this.isViewportAtMobileWidth()) {
      await this.expectElementToBeVisible(addThumbnailImageButton, false);
    } else {
      await expect(this.page.locator('body')).not.toHaveClass(/modal-open/);
    }
  }

  /**
   * Updates the post title and blurs the field to commit the editor value.
   * @param {string} title - The title to set.
   */
  async updateBlogPostTitle(title: string): Promise<void> {
    const titleInput = this.page.locator(blogTitleInput);
    await titleInput.fill(title);
    await titleInput.press('Tab');
    await expect(titleInput).toHaveValue(title);
  }

  /**
   * Activates the rich text body editor when needed and replaces its content.
   * @param {string} text - The body text to set.
   */
  async updateBodyTextTo(text: string): Promise<void> {
    if (!(await this.isElementVisible(blogBodyEditorSelector, true, 1000))) {
      await this.page.locator(blogBodyDisplaySelector).click();
    }
    const bodyEditor = this.page.locator(blogBodyInput).first();
    await expect(bodyEditor).toBeVisible();
    // The rich-text editor updates its Angular model from keyboard events.
    await bodyEditor.click();
    await bodyEditor.pressSequentially(text);
    await expect(bodyEditor).toHaveText(text);
  }

  /**
   * Selects a blog tag using its inner button and verifies its pressed state.
   * @param {string} tag - The tag to select.
   */
  async selectTag(tag: string): Promise<void> {
    const tagButton = this.page
      .locator(blogTagSelector)
      .filter({has: this.page.getByText(tag, {exact: true})})
      .locator('button.mat-button-toggle-button');
    await expect(tagButton).toHaveAttribute('aria-pressed', 'false');
    await tagButton.click();
    await expect(tagButton).toHaveAttribute('aria-pressed', 'true');
  }

  /**
   * Saves the edited body and waits for both editor controls to disappear.
   */
  async saveBlogBodyChanges(): Promise<void> {
    await this.page.locator(blogBodySaveButton).click();
    await this.expectElementToBeVisible(blogBodySaveButton, false);
    await this.expectElementToBeVisible(blogBodyEditorSelector, false);
  }

  /**
   * Saves a post as a draft and waits until the action button is disabled.
   */
  async saveTheDraftBlogPost(): Promise<void> {
    await this.page.locator(saveDraftButton).click();
    await expect(this.page.locator(saveDraftButton)).toBeDisabled();
  }

  /**
   * Confirms publication and waits for the persisted success state.
   */
  async publishTheBlogPost(): Promise<void> {
    await this.page.locator(publishBlogPostButton).click();
    await this.expectElementToBeVisible(confirmButton);
    await this.page.locator(confirmButton).click();
    const publishSuccessToast = this.page
      .locator(toastMessageSelector)
      .filter({hasText: 'Blog Post Saved and Published Successfully.'});
    await expect(publishSuccessToast).toBeVisible();
    await expect(publishSuccessToast).toBeHidden();
    await expect(this.page.locator(publishBlogPostButton)).toBeDisabled();
  }
}

export const BlogPostEditorFactory = (page: Page): BlogPostEditor => {
  return new BlogPostEditor(page);
};
