// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Blog Admin users utility file.
 */

import {expect, Page} from '@playwright/test';
import {BaseUser} from '../common/playwright-utils';
import {BlogRoles} from '../common/test-constants';
import testConstants from '../common/test-constants';

const blogAdminUrl = testConstants.URLs.BlogAdmin;
const roleUpdateUsernameInput = 'input#label-target-update-form-name';
const roleUpdateSelect = 'select#label-target-update-form-role-select';
const updateRoleButton = 'button.oppia-blog-admin-update-role-button';
const toastMessageSelector = '.e2e-test-toast-message';

export class BlogAdmin extends BaseUser {
  /**
   * Navigates to the blog admin page.
   */
  async navigateToBlogAdminPage(): Promise<void> {
    await this.goto(blogAdminUrl);
    await this.expectElementToBeVisible(roleUpdateUsernameInput);
  }

  /**
   * Assigns a blog role and waits for the confirmation and form reset.
   * @param {string} username - The username receiving the role.
   * @param {BlogRoles} role - The blog role to assign.
   */
  async assignUserToRoleFromBlogAdminPage(
    username: string,
    role: BlogRoles
  ): Promise<void> {
    await this.select(roleUpdateSelect, role);
    await this.page.locator(roleUpdateUsernameInput).fill(username);
    await this.clickOnElementWithSelector(updateRoleButton);
    const expectedSuccessMessage = `Role of ${username} successfully updated to ${role}`;
    const successMessage = this.page
      .locator(toastMessageSelector)
      .filter({hasText: expectedSuccessMessage});
    await expect(successMessage).toHaveText(expectedSuccessMessage);

    await expect(this.page.locator(roleUpdateUsernameInput)).toHaveValue('');
    await expect(this.page.locator(roleUpdateSelect)).toHaveValue('');

    if (this.isViewportAtMobileWidth()) {
      await successMessage.click();
      await expect(successMessage).toBeHidden();
    }
  }
}

export const BlogAdminFactory = (page: Page): BlogAdmin => {
  return new BlogAdmin(page);
};
