/** A placeholder while a screen loads: shimmering blocks in the shape of the cards to come (announced as "Loading"). */
export const Loading = () => (
  <div role="status" aria-label="Loading">
    <div className="skeleton" />
    <div className="skeleton tall" />
  </div>
)
