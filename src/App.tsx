/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import { PublicLayout } from './components/PublicLayout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage, NotFoundPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';

const VALID_CATEGORY_SLUGS = new Set([
  'computers',
  'phones-accessories',
  'gadgets',
  'telecommunications',
  'cac-arena',
  'branding-printing',
]);

const ValidatedCategoryRoute: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  if (!categorySlug || !VALID_CATEGORY_SLUGS.has(categorySlug)) {
    return <NotFoundPage />;
  }
  return <CategoryPage />;
};

export default function App() {
  return (
    <BlogProvider>
      <BrowserRouter>
        <Routes>
          {/* Dedicated Private Administrator Portal */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Public Blog Website Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/search"
            element={
              <PublicLayout>
                <SearchPage />
              </PublicLayout>
            }
          />
          <Route
            path="/:categorySlug"
            element={
              <PublicLayout>
                <ValidatedCategoryRoute />
              </PublicLayout>
            }
          />
          <Route
            path="/:categorySlug/:articleSlug"
            element={
              <PublicLayout>
                <ArticlePage />
              </PublicLayout>
            }
          />
          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFoundPage />
              </PublicLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </BlogProvider>
  );
}
