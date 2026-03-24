export type Topic = { id: string; label: string }
export type TopicGroup = { label: string; topics: Topic[] }

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    label: 'Musical Genres',
    topics: [
      { id: 'jazz', label: 'Jazz' },
      { id: 'rock', label: 'Rock' },
      { id: 'pop', label: 'Pop' },
      { id: 'classical', label: 'Classical' },
      { id: 'electronic', label: 'Electronic' },
      { id: 'hip-hop', label: 'Hip-Hop' },
      { id: 'country', label: 'Country' },
      { id: 'rnb', label: 'R&B' },
      { id: 'metal', label: 'Metal' },
      { id: 'folk', label: 'Folk' },
      { id: 'reggae', label: 'Reggae' },
      { id: 'world', label: 'World Music' },
      { id: 'latin', label: 'Latin' },
    ],
  },
  {
    label: 'Podcast Categories',
    topics: [
      { id: 'pod-tech', label: 'Technology' },
      { id: 'pod-truecrime', label: 'True Crime' },
      { id: 'pod-comedy', label: 'Comedy' },
      { id: 'pod-news', label: 'News & Politics' },
      { id: 'pod-sports', label: 'Sports' },
      { id: 'pod-business', label: 'Business' },
      { id: 'pod-science', label: 'Science' },
      { id: 'pod-history', label: 'History' },
      { id: 'pod-health', label: 'Health & Wellness' },
      { id: 'pod-education', label: 'Education' },
    ],
  },
  {
    label: 'US Regions',
    topics: [
      { id: 'us-northeast', label: 'Northeast' },
      { id: 'us-mid-atlantic', label: 'Mid-Atlantic' },
      { id: 'us-south', label: 'The South' },
      { id: 'us-great-lakes', label: 'Great Lakes' },
      { id: 'us-midwest', label: 'Midwest' },
      { id: 'us-southwest', label: 'Southwest' },
      { id: 'us-mountain', label: 'Mountain West' },
      { id: 'us-pacific', label: 'Pacific Coast' },
    ],
  },
]

export const MIN_INTERESTS = 3
