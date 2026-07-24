import { site } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>{site.name}</strong>
          <p>{site.tagline}</p>
        </div>
        <div className="footer-meta">
          <p>{site.preorder.cutoff}</p>
          <p>{site.preorder.pickupDay}</p>
          <p>{site.preorder.pickupLocation}</p>
        </div>
      </div>
    </footer>
  )
}
