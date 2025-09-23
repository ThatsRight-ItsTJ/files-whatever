
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page).toHaveTitle(/Login/)
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      const response = {
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
          tokens: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          },
        },
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome back, Test User!')).toBeVisible()
  })

  test('should show GitHub OAuth button', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible()
  })

  test('should show HuggingFace OAuth button', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.getByRole('button', { name: 'Continue with HuggingFace' })).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByRole('link', { name: 'Create account' }).click()
    
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  })
})