import { test, expect } from '@playwright/test';

test.describe('Task Management V1 Core Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Ensure app renders properly
    await expect(page.locator('h1.brand-title')).toHaveText('TaskMaster Pro-Github');
  });

  test('1. Create a new task', async ({ page }) => {
    const timestamp = Date.now();
    const taskTitle = `E2E Automated Task ${timestamp}`;
    const taskDesc = `Created via Playwright test automation ${timestamp}`;

    // Click "New Task" button to show form
    await page.click('#add-task-btn');
    await expect(page.locator('#create-task-form')).toBeVisible();

    // Fill in form inputs
    await page.fill('#task-title-input', taskTitle);
    await page.fill('#task-desc-input', taskDesc);
    await page.selectOption('#task-priority-select', 'high');
    await page.selectOption('#task-category-select', 'testing');

    // Submit form
    await page.click('#save-task-submit');

    // Verify created task appears in list
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();
    await expect(page.locator('.task-desc', { hasText: taskDesc })).toBeVisible();
  });

  test('2. Display existing tasks and filter', async ({ page }) => {
    // Search for a specific seeded task or created task
    await page.fill('#task-search-input', 'Express');
    await expect(page.locator('.task-title', { hasText: 'Implement Express API endpoints' })).toBeVisible();

    // Clear search
    await page.fill('#task-search-input', '');
  });

  test('3. Mark task complete & toggle back', async ({ page }) => {
    const taskTitle = `Toggle Task ${Date.now()}`;
    
    // Create task
    await page.click('#add-task-btn');
    await page.fill('#task-title-input', taskTitle);
    await page.click('#save-task-submit');
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();

    // Locate the task card and click checkbox
    const taskCard = page.locator('.task-card', { hasText: taskTitle });
    const checkbox = taskCard.locator('.custom-checkbox');
    await checkbox.click();

    // Verify task gets completed class
    await expect(taskCard).toHaveClass(/completed/);

    // Filter by Completed tab
    await page.click('#filter-completed-btn');
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();

    // Filter back to All tab
    await page.click('#filter-all-btn');
  });

  test('4. Delete a task', async ({ page }) => {
    const taskTitle = `Delete Me Task ${Date.now()}`;

    // Create task
    await page.click('#add-task-btn');
    await page.fill('#task-title-input', taskTitle);
    await page.click('#save-task-submit');
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();

    // Click delete button on task card
    const taskCard = page.locator('.task-card', { hasText: taskTitle });
    await taskCard.locator('.delete-btn').click();

    // Verify task is removed from DOM
    await expect(page.locator('.task-title', { hasText: taskTitle })).not.toBeVisible();
  });

  test('5. Create a task with a due date shows formatted date on card', async ({ page }) => {
    const taskTitle = `Due Date Task ${Date.now()}`;

    // Create task with a due date
    await page.click('#add-task-btn');
    await page.fill('#task-title-input', taskTitle);
    await page.fill('#task-duedate-input', '2026-09-25');
    await page.click('#save-task-submit');
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();

    // Verify the task card shows the formatted due date
    const taskCard = page.locator('.task-card', { hasText: taskTitle });
    await expect(taskCard.locator('.task-date')).toHaveText('25 Sep 2026');
  });

  test('6. Create a task without a due date shows No Due Date fallback', async ({ page }) => {
    const taskTitle = `No Due Date Task ${Date.now()}`;

    // Create task without a due date
    await page.click('#add-task-btn');
    await page.fill('#task-title-input', taskTitle);
    await page.click('#save-task-submit');
    await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible();

    // Verify the task card shows the "No Due Date" fallback
    const taskCard = page.locator('.task-card', { hasText: taskTitle });
    await expect(taskCard.locator('.task-date')).toHaveText('No Due Date');
  });
});
