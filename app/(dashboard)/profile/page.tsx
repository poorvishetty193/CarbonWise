import React from 'react';
import type { Metadata } from 'next';
import { ProfileClient } from '../../../components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'User Profile - CarbonWise',
  description: 'Manage your weekly carbon budget settings, display name, user avatar picture, and explore earned eco achievement badges.',
};

/**
 * Profile server routing entrypoint.
 * Exports metadata for search engine optimization and accessibility,
 * rendering the interactive ProfileClient container.
 * 
 * @returns React element representing the profile settings route.
 */
export default function ProfilePage(): React.ReactElement {
  return <ProfileClient />;
}
